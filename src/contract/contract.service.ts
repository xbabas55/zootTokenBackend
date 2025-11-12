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
    clusterApiUrl
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
import { ResponseHelper } from 'library/helper/response';
import { error } from 'console';
import { RedisConfigService } from 'library/helper/config-helper';
import { Config,ConfigDocument } from 'library/helper/model/config-shcema';


@Injectable()
export class ContractService {
    private connection: Connection;
    private sender: Keypair;
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
        const secret = JSON.parse(this.configService.get<string>('SENDER_PRIVATE_KEY') || "[]");
        this.sender = Keypair.fromSecretKey(Uint8Array.from(secret));
        
        Logger.log(this.TAG, this.sender.publicKey.toString());

        //anchor.setProvider(anchor.AnchorProvider.env());
        
        this.program = anchor.workspace.Zoot as Program<Zoot>;
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
                this.sender,
                this.sender.publicKey,
                this.sender.publicKey,
                decimal,
                Keypair.generate(),
                { commitment: "confirmed" }
            );
            Logger.log(this.TAG, "token created key=" + mint.toString());

            adminAta = (
                await getOrCreateAssociatedTokenAccount(
                    this.connection,
                    this.sender,
                    mint,
                    this.sender.publicKey,
                    false,
                    "confirmed",
                    { commitment: "confirmed" }
                )
            ).address;

            Logger.log(this.TAG, "adminATA created key=" + adminAta.toString());

            await mintTo(
                this.connection,
                this.sender,
                mint,
                adminAta,
                this.sender.publicKey,
                BigInt(1_000_000_000_000) * BigInt(1_000_000_000),
                [],
                { commitment: "confirmed" },
            );
            // balance of token in adminAta
            const tokenBalance = await this.connection.getTokenAccountBalance(adminAta);

            Logger.log(this.TAG, "token balance is " + tokenBalance.toString());

            await this.presaleConfig.set("tokenMint",{
                key: "tokenMint",
                value: mint.toString()
            });

            await this.presaleConfig.set("admin_ata",{
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
            Logger.log(this.TAG, "presale address is " + presalePDA);

            const softCapAmount: number = Number((await this.presaleConfig.getByKey("softCap"))?.value ?? 0);
            const hardCapAmount: number = Number((await this.presaleConfig.getByKey("hardCap"))?.value ?? 0);
            const maxTokenAmountPerAddress: number = Number((await this.presaleConfig.getByKey("maxTokenPerUser"))?.value ?? 0);
            const maxTokenAmountPerDay: number = Number((await this.presaleConfig.getByKey("maxTokenPerDay"))?.value ?? 0);
            const public_token_price: number = Number((await this.presaleConfig.getByKey("pub_price"))?.value ?? 100);

            const private_token_price: number = Number((await this.presaleConfig.getByKey("pri_price"))?.value ?? 100);
            const seed_token_price: number = Number((await this.presaleConfig.getByKey("seed_price"))?.value ?? 100);

            const config = await this.presaleConfig.getByKey("tokenMint");
            const mint = new PublicKey(config?.value ?? PublicKey.default.toBase58());
            Logger.log(this.TAG, "presale step " + mint);

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
                    authority: this.sender.publicKey,
                })
                .signers([this.sender])
                .transaction();

            tx.feePayer = this.sender.publicKey;
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            Logger.log(this.TAG, "presale step " + 2);
            // transcation confirmation stage
            Logger.log(this.TAG, await this.connection.simulateTransaction(tx));
            const signature = await sendAndConfirmTransaction(this.connection, tx, [this.sender]);
            Logger.log(this.TAG, "Transaction success + " + signature.toString());
            this.response.success(200, "create mint", {

            });
        }
        catch (err) {
            Logger.error(this.TAG,err)
            this.response.fail(100, "fail success", err);
        }
    }

    async depositToken() {
        try {
            let presalePDA = await this.getPresalePDA();
            let presaleValut = await this.getVaultPDA();
            const mintconfig = await this.presaleConfig.getByKey("tokenMint");
            console.log("1111" , mintconfig?.value);
            const mint = new PublicKey(mintconfig?.value ?? PublicKey.default.toBase58());

            const toAssociatedTokenAccount = await getAssociatedTokenAddress(mint, presalePDA, true);

            console.log("1111" , toAssociatedTokenAccount.toString());
            
            let config = await this.presaleConfig.getByKey("presaleAmount");
            const presaleAmount = Number(config?.value ?? 0);
            config = await this.presaleConfig.getByKey("rewardAmount");

            const presaleAta = getAssociatedTokenAddressSync(mint, presalePDA, true);

// admin's ATA (authority = wallet)
            const adminAta = getAssociatedTokenAddressSync(mint, this.sender.publicKey);
            console.log("admin wallet for deposit ", this.sender.publicKey.toBase58())
            // preparing transaction
            const tx = await this.program.methods
                .depositToken(new BN(presaleAmount))
                .accounts({
                    admin: this.sender.publicKey,
                })
                // .signers([this.sender])
                .instruction();
                console.log(tx);

            // tx.feePayer = this.sender.publicKey;
            // tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

            // console.log(await this.connection.simulateTransaction(tx));

            // const signature = await sendAndConfirmTransaction(this.connection, tx, [this.sender]);
            // console.log(
            //     `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
            // );
            // console.log("Token mint address: ", mint.toBase58());
            // console.log(
            //     "Token balance of presaleAta: ",
            //     await this.connection.getTokenAccountBalance(toAssociatedTokenAccount)
            // );
            // console.log(
            //     "Sol balance of presale vault: ",
            //     await this.connection.getBalance(presaleValut)
            // );
        } catch (err) {
            Logger.error(this.TAG, err);
        }


    }

    async showAll(){
          const mintconfig = await this.presaleConfig.getByKey("tokenMint");
           let config = await this.presaleConfig.getByKey("presaleAmount");
           return this.response.success(200,"1111",
            {
                mint:mintconfig,
                config: config
            }
           );
    }


}
