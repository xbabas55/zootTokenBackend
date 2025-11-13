import { HttpCode, Injectable, Logger } from '@nestjs/common';

import {
    Connection,
    PublicKey,
    Transaction,
    VersionedTransaction,
    SystemProgram,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    clusterApiUrl,
    Message
} from '@solana/web3.js';

import {
    createMint,
    getAssociatedTokenAddress,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Program, BN } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import type { Zoot } from "../../target/types/zoot";
import idl from "../../target/idl/zoot.json";
import { ResponseHelper } from 'library/helper/response';
import { error } from 'console';
import { RedisConfigService } from 'library/helper/config-helper';
import { Config, ConfigDocument } from 'library/helper/model/config-shcema';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';


@Injectable()
export class ContractService {
    private connection: Connection;
    private admin: Keypair;
    private program: Program<Zoot>;
    private PROGRAM_ID: PublicKey;
    private TAG: string;

    constructor(
        private configService: ConfigService,
        private readonly response: ResponseHelper,
        private readonly presaleConfig: RedisConfigService) {
        this.TAG = "ContractService";
        const rpcUrl = this.configService.get<string>('RPC') || clusterApiUrl("testnet");
        this.connection = new Connection(rpcUrl, "confirmed");
        const secret = JSON.parse(this.configService.get<string>('PRIVATE_KEY') || "[]");
        this.admin = Keypair.fromSecretKey(Uint8Array.from(secret));

        Logger.log(this.TAG, this.admin.publicKey.toString());

        //anchor.setProvider(anchor.AnchorProvider.env());
        const provider = new anchor.AnchorProvider(this.connection, new NodeWallet(this.admin), {
            commitment: "confirmed"
        });

        anchor.setProvider(provider);

        this.program = new Program(
            idl,
            provider
        ) as Program<Zoot>;

        this.PROGRAM_ID = this.program.programId;
    }

    async getUserInfoPDA(user: PublicKey) {
        const userSeed = this.configService.get<string>('USER_SEED') || 'USER_SEED';
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from(userSeed, 'utf-8'), user.toBuffer()],
            this.PROGRAM_ID
        );
        return pda;
    }

    async getPresalePDA() {
        const presale_seed = this.configService.get<string>('PRESALE_SEED') || 'PRESALE_SEED';
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from(presale_seed, 'utf-8')],
            this.PROGRAM_ID
        );
        return pda;
    }

    async getVaultPDA() {
        const presaleValut = this.configService.get<string>('PRESALE_VAULT') || 'PRESALE_VAULT';
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from(presaleValut, 'utf-8')],
            this.PROGRAM_ID
        );
        return pda;
    }

    async createmint() {
        let mint: PublicKey;
        let adminAta: PublicKey;
        try {
            let decimal = this.configService.get<number>("TOKEN_DECIMAL") || 9;
            Logger.log(this.TAG, "token created key=" + decimal.toString());
            mint = await createMint(
                this.connection,
                this.admin,
                this.admin.publicKey,
                this.admin.publicKey,
                decimal,
                Keypair.generate(),
                { commitment: "confirmed" }
            );
            Logger.log(this.TAG, "token created key=" + mint.toString());

            adminAta = (
                await getOrCreateAssociatedTokenAccount(
                    this.connection,
                    this.admin,
                    mint,
                    this.admin.publicKey,
                    false,
                    "confirmed",
                    { commitment: "confirmed" }
                )
            ).address;

            Logger.log(this.TAG, "adminATA created key=" + adminAta.toString());

            await mintTo(
                this.connection,
                this.admin,
                mint,
                adminAta,
                this.admin.publicKey,
                BigInt(1_000_000_000_000) * BigInt(1_000_000_000),
                [],
                { commitment: "confirmed" },
            );
            // balance of token in adminAta
            const tokenBalance = await this.connection.getTokenAccountBalance(adminAta);

            Logger.log(this.TAG, "token balance is " + tokenBalance.toString());

            await this.presaleConfig.set("tokenMint", {
                key: "tokenMint",
                value: mint.toString()
            });

            await this.presaleConfig.set("admin_ata", {
                key: "admin_ata",
                value: adminAta.toString()
            });




            return this.response.success(200,
                "token minted",
                { tokenBalance: tokenBalance });

        }
        catch (err) {
            Logger.error(this.TAG, err);

            return this.response.fail(101, "fail", err);
        }
    }

    async presaleInit() {
        try {
            let presalePDA = await this.getPresalePDA();

            const softCapAmount: number = Number((await this.presaleConfig.getByKey("softCap"))?.value ?? 0);
            const hardCapAmount: number = Number((await this.presaleConfig.getByKey("hardCap"))?.value ?? 0);
            const maxTokenAmountPerAddress: number = Number((await this.presaleConfig.getByKey("maxTokenPerUser"))?.value ?? 0);
            const maxTokenAmountPerDay: number = Number((await this.presaleConfig.getByKey("maxTokenPerDay"))?.value ?? 0);
            const public_token_price: number = Number((await this.presaleConfig.getByKey("pub_price"))?.value ?? 100);

            const private_token_price: number = Number((await this.presaleConfig.getByKey("pri_price"))?.value ?? 100);
            const seed_token_price: number = Number((await this.presaleConfig.getByKey("seed_price"))?.value ?? 100);

            const config = await this.presaleConfig.getByKey("tokenMint");
            const mint = new PublicKey(config?.value ?? PublicKey.default.toBase58());

            const tx = await this.program.methods
                .createPresale(
                    new BN(softCapAmount),
                    new BN(hardCapAmount),
                    new BN(maxTokenAmountPerAddress),
                    new BN(maxTokenAmountPerDay),
                    new BN(public_token_price),
                    new BN(private_token_price),
                    new BN(seed_token_price)
                )
                .accounts({
                    tokenMint: mint,
                    authority: this.admin.publicKey,
                })
                .transaction();

            tx.feePayer = this.admin.publicKey;
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

            // Logger.log(this.TAG, await this.connection.simulateTransaction(tx));
            const signature = await sendAndConfirmTransaction(this.connection, tx, [this.admin]);

            Logger.log(this.TAG, "Transaction success + " + signature.toString());
            this.response.success(200, "create mint", {

            });
        }
        catch (err) {
            Logger.error(this.TAG, err)
            this.response.fail(100, "fail success", err);
        }
    }

    async depositToken() {
        try {
            let presalePDA = await this.getPresalePDA();
            let presaleValut = await this.getVaultPDA();
            const mintconfig = await this.presaleConfig.getByKey("tokenMint");

            const mint = new PublicKey(mintconfig?.value ?? PublicKey.default.toBase58());

            const toAssociatedTokenAccount = await getAssociatedTokenAddress(mint, presalePDA, true);

            let config = await this.presaleConfig.getByKey("presaleAmount");
            const presaleAmount = Number(config?.value ?? 0);



            // const configs: ConfigDocument = {
            //     key: 'softCap',
            //     value: '20000000000',
            // } as ConfigDocument;
            // await this.presaleConfig.set("presaleAmount", configs);

            Logger.verbose(this.TAG, "preslaeAmount " + presaleAmount);
            config = await this.presaleConfig.getByKey("rewardAmount");

            // preparing transaction
            const tx = await this.program.methods
                .depositToken(new BN(presaleAmount))
                .accounts({
                    admin: this.admin.publicKey,
                })
                .transaction();

            tx.feePayer = this.admin.publicKey;
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

            console.log(await this.connection.simulateTransaction(tx));

            const signature = await sendAndConfirmTransaction(this.connection, tx, [this.admin]);
            console.log(
                `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
            );

            console.log(
                "Token balance of presaleAta: ",
                await this.connection.getTokenAccountBalance(toAssociatedTokenAccount)
            );
            console.log(
                "Sol balance of presale vault: ",
                await this.connection.getBalance(presaleValut)
            );
        } catch (err) {
            Logger.error(this.TAG, err);
        }
    }

    async showAll() {
        const mintconfig = await this.presaleConfig.getByKey("tokenMint");
        let config = await this.presaleConfig.getByKey("presaleAmount");
        return this.response.success(200, "1111",
            {
                mint: mintconfig,
                config: config
            }
        );
    }

    async presaleStart() {
        let presaleDuration = new BN(await this.configService.get("presaleDuration")?.value ?? 60 * 60 * 24 * 100);
        let startTime = new BN(Date.now());
        let endTime = startTime.add(presaleDuration);

        // preparing transaction
        const tx = await this.program.methods
            .startPresale(startTime, endTime)
            .accounts({
                authority: this.admin.publicKey,
            })
            .transaction();

        tx.feePayer = this.admin.publicKey;
        tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

        const signature = await sendAndConfirmTransaction(this.connection, tx, [this.admin]);

        console.log(
            `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
        );
        console.log(
            "Start time: ",
            new Date(parseInt(startTime.toString())),
            "----",
            startTime.toNumber()
        );
        console.log(
            "End time: ",
            new Date(parseInt(endTime.toString())),
            "----",
            endTime.toNumber()
        );
    }

    async getTokenMint() {
        return await this.presaleConfig.getByKey("tokenMint");
        // try {
        //     const token = await this.configService.get("tokenMint")?.value;
        //     return this.response.fail(100,this.TAG,token);
        // } catch (err) {
        //     Logger.error(this.TAG, err);
        //     return this.response.fail(100,this.TAG,err)
        // }

    }

    async updateLimit() {

        // preparing transaction
        const tx = await this.program.methods
            .initDayLimit(new BN(100 * LAMPORTS_PER_SOL))
            .accounts({
                authority: this.admin.publicKey
            })
            .transaction();

        tx.feePayer = this.admin.publicKey;
        tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

        console.log(await this.connection.simulateTransaction(tx));

        const signature = await sendAndConfirmTransaction(this.connection, tx, [
            this.admin,
        ]);
        console.log(
            `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
        );
    }

    async updateUserLimit() {

        // preparing transaction
        const tx = await this.program.methods
            .initUserLimit(new BN(100 * LAMPORTS_PER_SOL))
            .accounts({
                authority: this.admin.publicKey
            })
            .transaction();

        tx.feePayer = this.admin.publicKey;
        tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

        console.log(await this.connection.simulateTransaction(tx));

        const signature = await sendAndConfirmTransaction(this.connection, tx, [
            this.admin,
        ]);
        console.log(
            `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
        );
    }

    async updateCapLimit() {
        const tx = await this.program.methods
            .initHardLimit(new BN(1000 * LAMPORTS_PER_SOL))
            .accounts({
                authority: this.admin.publicKey
            })
            .transaction();

        tx.feePayer = this.admin.publicKey;
        tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

        console.log(await this.connection.simulateTransaction(tx));

        const signature = await sendAndConfirmTransaction(this.connection, tx, [
            this.admin,
        ]);
        console.log(
            `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
        );
    }

    async getPresaleState() {
        const presaleInfo = await this.program.account.presaleInfo.fetch(await this.getPresalePDA());
        console.log("⏰ Remaining time:", presaleInfo);
    }



}
