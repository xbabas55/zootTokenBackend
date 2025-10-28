import { Injectable } from '@nestjs/common';
import { Connection, PublicKey, Transaction, VersionedTransaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
import axios from 'axios';

@Injectable()
export class SolanaService {
  private connection: Connection;
  private sender: Keypair;

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
    const secret = JSON.parse(process.env.SENDER_PRIVATE_KEY || "[]");
    this.sender = Keypair.fromSecretKey(Uint8Array.from(secret));
  }

  async getQuote(inputMint: string, outputMint: string, amount: number) {
    // amount in smallest units (lamports for SOL, decimals for tokens)
    const response = await axios.get('https://quote-api.jup.ag/v6/quote', {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps: 50, // 0.5%
      },
    });

    return response.data;
  }

  async getSwapTransaction(wallet: string, inputMint: string, outputMint: string, amount: number) {
    const quote = await this.getQuote(inputMint, outputMint, amount);

    const { data } = await axios.post(
      'https://quote-api.jup.ag/v6/swap',
      {
        userPublicKey: wallet,
        quoteResponse: quote,
      },
      { headers: { 'Content-Type': 'application/json' } },
    );

    // Jupiter returns a base64-encoded transaction
    const swapTx = VersionedTransaction.deserialize(Buffer.from(data.swapTransaction, 'base64'));
    return swapTx;
  }

  async sendSol(fromSecretKey: number[], toAddress: string, amountSol: number) {
    // Load sender wallet
    const fromWallet = Keypair.fromSecretKey(Uint8Array.from(fromSecretKey));

    // Receiver public key
    const toPublicKey = new PublicKey(toAddress);

    // Convert SOL → lamports (1 SOL = 1e9 lamports)
    const lamports = amountSol * LAMPORTS_PER_SOL;

    // Create transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toPublicKey,
        lamports,
      }),
    );

    // Send transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [fromWallet],
    );

    console.log('✅ Transfer complete:', signature);
    return signature;
  }

}