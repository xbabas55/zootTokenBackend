import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Keypair,
  TransactionInstruction ,
  Transaction
} from '@solana/web3.js';

import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint
  
} from "@solana/spl-token";

import { WalletHistory } from './schemas/wallet-history.schema';
import { TokenDistribution } from './schemas/token-distribution.schema';

// -----------------------------
// Simple AppLogger (drop-in)
// -----------------------------
export class AppLogger {
  private readonly logger: Logger;

  constructor(context = 'WalletService') {
    this.logger = new Logger(context);
  }

  info(message: string, meta?: any) {
    this.logger.log(this.format(message, meta));
  }

  warn(message: string, meta?: any) {
    this.logger.warn(this.format(message, meta));
  }

  error(message: string, meta?: any) {
    this.logger.error(this.format(message, meta));
  }

  debug(message: string, meta?: any) {
    this.logger.debug(this.format(message, meta));
  }

  private format(message: string, meta?: any) {
    if (!meta) return message;
    try {
      return `${message} | ${JSON.stringify(meta)}`;
    } catch (e) {
      return `${message} | [unserializable meta]`;
    }
  }
}

@Injectable()
export class WalletService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new AppLogger(WalletService.name);
  private readonly connection: Connection;
  private readonly walletPubkey: PublicKey;
  private readonly trackMs: number;
  private readonly scanPeriodMs: number;

  private wsSubscriptionId: number | null = null;
  private wsReconnectBackoff = 1000; // start 1s
  private readonly maxWsBackoff = 60_000; // 60s
  private readonly rpcMaxRetries = 6;
  private token_mint: PublicKey;
  private exchange_rate: number;
  private admin: Keypair;

  constructor(
    @InjectModel(WalletHistory.name)
    private readonly historyModel: Model<WalletHistory>,
    @InjectModel(TokenDistribution.name)
    private readonly tokenDistModel: Model<TokenDistribution>,
    private readonly config: ConfigService,
  ) {
    const rpcUrl = this.config.get<string>('RPC') || clusterApiUrl('mainnet-beta');

    // Keep the Connection simple and use committed reads (faster, less rate limited)
    this.connection = new Connection(rpcUrl, { commitment: 'confirmed' });

    const wallet = this.config.get<string>('WALLET_ADDRESS');
    if (!wallet) throw new Error('WALLET_ADDRESS must be set in config');
    this.walletPubkey = new PublicKey(wallet);

    this.trackMs = Number(this.config.get<string>('TRACK_PERIOD') ?? 1) * 60_000; // minutes -> ms
    this.scanPeriodMs = Number(this.config.get<string>('PERIOD') ?? 30) * 2 * 1000; // as original behavior
    this.exchange_rate = Number(this.config.get<string>('PRICE') ?? 100000000);

    const secret = JSON.parse(this.config.get<string>('PRIVATE_KEY') || "[]");
    this.admin = Keypair.fromSecretKey(Uint8Array.from(secret));

    this.token_mint = new PublicKey( this.config.get<string>("TOKEN_MINT")?? PublicKey.default.toBase58());
  }



  // -----------------------------
  // Lifecycle
  // -----------------------------
  async onModuleInit() {
    this.log.info('Initializing WalletService');
    this.subscribeWebSocket();

  }

  async onModuleDestroy() {
    this.log.info('Shutting down WalletService');
    if (this.wsSubscriptionId !== null) {
      try {
        this.connection.removeOnLogsListener(this.wsSubscriptionId);
      } catch (e) {
        // ignore
      }
      this.wsSubscriptionId = null;
    }
  }

  // -----------------------------
  // RPC helper w/ retries & exponential backoff
  // -----------------------------
  private async rpcRetry<T>(fn: () => Promise<T>, maxRetries = this.rpcMaxRetries): Promise<T> {
    let attempt = 0;
    let delay = 300; // ms initial

    while (true) {
      try {
        const start = Date.now();
        const res = await fn();
        const took = Date.now() - start;
        this.log.debug('RPC call finished', { tookMs: took, attempt });
        return res;
      } catch (err: any) {
        attempt += 1;
        const is429 = (err?.message && err.message.includes('429')) || err?.code === 429;
        const isRate = is429 || (err?.message && err.message.toLowerCase().includes('too many requests'));

        if (!isRate) {
          // non-rate errors: throw immediately
          this.log.error('Non-rate RPC error', { message: err?.message ?? err });
          throw err;
        }

        if (attempt > maxRetries) {
          this.log.error('RPC rate-limit retry exhausted', { attempt, maxRetries });
          throw err;
        }

        this.log.warn('RPC 429 Too Many Requests — retrying', { attempt, delay });
        await this.sleep(delay);
        delay = Math.min(delay * 2, 20_000); // cap backoff
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // -----------------------------
  // WebSocket subscription (onLogs) with auto-reconnect
  // -----------------------------
  private subscribeWebSocket() {
    try {
      this.log.info('Attempting to subscribe to onLogs for wallet');

      // onLogs returns a listener id in web3.js; wrap callback to catch errors
      const listenerId = this.connection.onLogs(
        this.walletPubkey,
        async (log) => {
          try {
            if (!log || !log.signature) return;
            this.log.debug('WS log received', { signature: log.signature });
            await this.handleWsLog(log.signature, log);
          } catch (e: any) {
            this.log.error('Error processing WS log', { error: e?.message ?? e });
          }
        },
        'confirmed',
      );

      this.wsSubscriptionId = listenerId as unknown as number;
      this.wsReconnectBackoff = 1000; // reset backoff on success
      this.log.info('WebSocket subscribed', { listenerId: this.wsSubscriptionId });
    } catch (e: any) {
      this.log.error('Failed to subscribe WebSocket', { error: e?.message ?? e });

      // schedule reconnect with backoff
      setTimeout(() => this.subscribeWebSocket(), this.wsReconnectBackoff);
      this.wsReconnectBackoff = Math.min(this.wsReconnectBackoff * 2, this.maxWsBackoff);
      this.log.warn('Scheduled WS reconnect', { nextInMs: this.wsReconnectBackoff });
    }
  }

  // Helper to remove listener safely (web3.js v1/v2 differences)
  private removeWsListener() {
    if (this.wsSubscriptionId === null) return;
    try {
      // web3.js has different APIs; try both
      // @ts-ignore
      if (typeof this.connection.removeOnLogsListener === 'function') {
        // v1/v2 style
        // @ts-ignore
        this.connection.removeOnLogsListener(this.wsSubscriptionId);
      } else if (typeof (this.connection as any).removeListener === 'function') {
        // alternate
        // @ts-ignore
        (this.connection as any).removeListener(this.wsSubscriptionId);
      }
    } catch (e) {
      // ignore
    }
    this.wsSubscriptionId = null;
  }

  // -----------------------------
  // WS log handling -> parse tx and store if incoming
  // -----------------------------
  private async handleWsLog(signature: string, rawLog: any) {
    // quick dup check
    const exists = await this.historyModel.exists({ txSignature: signature });
    if (exists) {
      this.log.debug('Signature already exists (WS)', { signature });
      return;
    }

    // get parsed tx with retry
    let tx: any;
    try {
      tx = await this.rpcRetry(() =>
        this.connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 }),
      );
    } catch (e) {
      this.log.warn('Failed to fetch parsed tx (WS), will leave to sync', { signature, reason: e?.message ?? e });
      return;
    }

    if (!tx || !tx.meta) return;

    // find our account index
    const accounts = tx.transaction.message.accountKeys;
    const index = accounts.findIndex((a: any) => a.pubkey.equals(this.walletPubkey));
    if (index === -1) return;

    const pre = tx.meta.preBalances[index];
    const post = tx.meta.postBalances[index];
    if (post <= pre) return; // not incoming

    const amountLamports = post - pre;
    const amountSol = amountLamports / LAMPORTS_PER_SOL;

    // sender guess (first account that isn't system program; best-effort)
    const sender = accounts[0]?.pubkey?.toBase58?.() ?? 'unknown';

    // timestamp prefer sig.blockTime -> tx.blockTime -> now
    // rawLog may not contain blockTime; we rely on sync to fill if missing
    const blockTime = (rawLog && rawLog.blockTime) ?? tx.blockTime ?? Math.floor(Date.now() / 1000);

    await this.safeStore(signature, sender, amountSol, blockTime, 'ws');
  }

  // -----------------------------
  // Safe DB store with duplicate handling
  // -----------------------------
  private async safeStore(signature: string, sender: string, amountSol: number, timestampSec?: number, source = 'sync') {
    const timestamp = typeof timestampSec === 'number' ? timestampSec : Math.floor(Date.now() / 1000);
    try {
      await this.historyModel.create({
        txSignature: signature,
        sender,
        amountSol,
        amountToken: amountSol * this.exchange_rate,
        timestamp,
        source,
      } as any);

      this.log.info('Stored incoming deposit', { signature, sender, amountSol, timestamp, source });
    } catch (err: any) {
      if (err?.code === 11000) {
        this.log.warn('Duplicate signature skipped', { signature });
      } else {
        this.log.error('DB error storing tx', { signature, error: err?.message ?? err });
      }
    }
  }

  // -----------------------------
  // CRON: periodic sync (runs every minute) to backfill any missed txs
  // -----------------------------
  private lastSyncAt = 0;

  @Cron(CronExpression.EVERY_MINUTE)
  async syncHistoryCron() {
    const now = Date.now();
    // use trackMs to avoid scanning too often
    if (now - this.lastSyncAt < this.trackMs) return;
    this.lastSyncAt = now;

    await this.syncHistory();
  }

  // Fetch up to `pageSize` signatures, optionally before a signature. This wraps RPC with retry.
  private async getSignaturesForAddress(before?: string, pageSize = 1000) {
    return this.rpcRetry(() =>
      this.connection.getSignaturesForAddress(this.walletPubkey, before ? { before, limit: pageSize } : { limit: pageSize }),
    );
  }

  // Core sync routine
  async syncHistory() {
    this.log.info('SYNC START');
    const syncStart = Date.now();

    // get newest stored signature so we only fetch older signatures
    const lastEntry = await this.historyModel.findOne().sort({ timestamp: -1 }).lean();
    const beforeSig = lastEntry?.txSignature;

    let fetched = 0;
    let stored = 0;

    try {
      const signatures = await this.getSignaturesForAddress(beforeSig, 1000);

      if (!signatures || signatures.length === 0) {
        this.log.info('No new signatures to sync');
        return;
      }

      this.log.info('Signatures fetched for sync', { count: signatures.length });

      for (const sigEntry of signatures) {
        fetched += 1;
        const signature = sigEntry.signature;

        // skip duplicate quickly
        const exists = await this.historyModel.exists({ txSignature: signature });
        if (exists) continue;

        // small delay to avoid RPC bursts
        await this.sleep(50);

        let tx: any;
        try {
          tx = await this.rpcRetry(() =>
            this.connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 }),
          );
        } catch (e) {
          this.log.warn('Failed to fetch parsed tx during sync', { signature, reason: e?.message ?? e });
          continue;
        }

        if (!tx || !tx.meta) continue;

        const accounts = tx.transaction.message.accountKeys;
        const index = accounts.findIndex((a: any) => a.pubkey.equals(this.walletPubkey));
        if (index === -1) continue;

        const pre = tx.meta.preBalances[index];
        const post = tx.meta.postBalances[index];
        if (post <= pre) continue;

        const amountLamports = post - pre;
        const amountSol = amountLamports / LAMPORTS_PER_SOL;

        // prefer sigEntry.blockTime (from getSignaturesForAddress)
        const blockTime = sigEntry.blockTime ?? tx.blockTime ?? Math.floor(Date.now() / 1000);

        const sender = accounts[0]?.pubkey?.toBase58?.() ?? 'unknown';

        await this.safeStore(signature, sender, amountSol, blockTime, 'cron');
        stored += 1;
      }

      this.log.info('SYNC FINISHED', { tookMs: Date.now() - syncStart, fetched, stored });
    } catch (e: any) {
      this.log.error('Error during syncHistory', { error: e?.message ?? e });
    }
  }

  // -----------------------------
  // Public query helpers
  // -----------------------------
  async findAll() {
    console.log('COUNT: ', await this.historyModel.countDocuments());
    return this.historyModel.find().sort({ timestamp: -1 }).lean();
  }

  async findBySender(sender: string) {
    return this.historyModel.find({ sender }).sort({ timestamp: -1 }).lean();
  }


async calculateAllUserTokens() {
  const pipeline = [
    {
      $match: {
        is_exchange: { $ne: true }   // ❌ ignore rows marked as exchanged
      }
    },
    {
      $group: {
        _id: "$sender",
        totalSol: { $sum: "$amountSol" },
        totalToken: { $sum: "$amountToken" },
        lastTimestamp: { $max: "$timestamp" }
      }
    }
  ];

  const results = await this.historyModel.aggregate(pipeline);

  return results.map(user => ({
    wallet: user._id,
    totalSol: user.totalSol,
    tokenAmount: user.totalToken,
    lastTimestamp: user.lastTimestamp,
  }));
}


async distributeTokensToAllUsers() {
  const users = await this.calculateAllUserTokens();
  this.log.info(`Users to process: ${users.length}`);

  // ⚡ Load existing distributed records once (faster)
  const distributed = await this.tokenDistModel.find().lean();
  const distMap = new Map(distributed.map(d => [d.wallet, d]));

  for (const user of users) {
    const record = distMap.get(user.wallet);
    const delta = record ? user.tokenAmount - record.amountToken : user.tokenAmount;
    this.log.info(`Processing ${user.wallet}: total=${user.tokenAmount}, distributed=${record ? record.amountToken : 0}, delta=${delta}`);
    // 🛑 Case 1: Already distributed full amount → skip
    if (record && record.amountToken === user.tokenAmount) {
      this.log.warn(`Skipping ${user.wallet}: already fully distributed.`);
      continue;
    }

    // 🛑 Case 2: Partially distributed or not distributed → send remaining
    try {
      const txSig = await this.sendTokens(user.wallet, delta);

      if (!record) {
        // New distribution
        await this.tokenDistModel.create({
          wallet: user.wallet,
          amountSol: user.totalSol,
          amountToken: delta,
          txSignature: txSig,
        });
      } else {
        // Update existing record
        await this.tokenDistModel.updateOne(
          { wallet: user.wallet },
          {
            $set: {
              amountSol: user.totalSol,
              amountToken: delta + record.amountToken,
              txSignature: txSig,
            }
          }
        );
      }

      this.log.info(`🎉 Sent ${delta} tokens → ${user.wallet} | TX: ${txSig}`);
    } catch (err) {
      this.log.error(`Failed to send tokens to ${user.wallet}: ${err.message}`);
    }
  }

  return { status: "completed" };
}

  /**
   * Send SPL token
   */


  async sendTokens(receiverWallet: string, amountTokens: number) {
    const sender = this.admin;

    const receiverPubkey = new PublicKey(receiverWallet);

    // Sender ATA
    const senderAta = await getAssociatedTokenAddress(this.token_mint,sender.publicKey);

    // Receiver ATA (create if missing)
    const receiverAta = await getAssociatedTokenAddress(this.token_mint, receiverPubkey);

    const receiverAtaInfo = await this.connection.getAccountInfo(receiverAta);

    const instructions: TransactionInstruction[] = [];

    // Create receiver ATA if missing
    if (!receiverAtaInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          sender.publicKey,
          receiverAta,
          receiverPubkey,
          this.token_mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    // Transfer tokens
    instructions.push(
      createTransferInstruction(
        senderAta,
        receiverAta,
        sender.publicKey,
        amountTokens,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const tx = new Transaction().add(...instructions);

    const sig = await this.connection.sendTransaction(tx, [sender], {
      skipPreflight: false
    });

    await this.connection.confirmTransaction(sig, "confirmed");

    return sig;
  }



  async getTokenMintInfo(connection: Connection, mintAddress: string) {
    const mintPubkey = new PublicKey(mintAddress);

    const mintInfo = await getMint(connection, mintPubkey, undefined, TOKEN_PROGRAM_ID);

    return {
      mint: mintPubkey.toBase58(),
      decimals: mintInfo.decimals,
      supply: Number(mintInfo.supply), // bigint → number
      mintAuthority: mintInfo.mintAuthority?.toBase58() ?? null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() ?? null,
      isInitialized: mintInfo.isInitialized
    };
  }



async clearAllHistoryAndDistribution() {
  this.log.warn("⚠️ Clearing ALL history & distribution records...");

  const history = await this.historyModel.deleteMany({});
  const dist = await this.tokenDistModel.deleteMany({});

  this.log.warn(`🗑️ Deleted: history=${history.deletedCount}, dist=${dist.deletedCount}`);

  return {
    status: "success",
    historyDeleted: history.deletedCount,
    distributionDeleted: dist.deletedCount,
  };
}


}
