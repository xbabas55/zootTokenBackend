import { Controller, Get, Query, Post, Body, Logger } from '@nestjs/common';
import { SolanaService } from '../solana/solana.service';
import { Console } from 'console';
import { ContractService } from 'src/contract/contract.service';
import { ConfigDocument } from 'library/helper/model/config-shcema';

@Controller('presale')
export class TokenomicsController {

    private TAG: string;
    constructor(
        private readonly solanaService: SolanaService,
        private readonly contractService: ContractService) {
        this.TAG = "tokenomics";
    }

    @Get()
    async swap(
        @Query('wallet') wallet: string,
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('amount') amount: string,
    ) {
        const lamports = Math.floor(parseFloat(amount) * 1e9); // convert SOL to lamports
        const tx = await this.solanaService.getSwapTransaction(wallet, from, to, lamports);
        return { transaction: tx };
    }

    @Post('transfer')
    async transferSol(
        @Body() body: { fromSecretKey: number[]; toAddress: string; amountSol: number },
    ) {
        return this.solanaService.sendSol(body.fromSecretKey, body.toAddress, body.amountSol);
    }


    @Post('buyZoot')
    async buyZoot(@Body() body: { sol: number, pubkey: string }) {
        Logger.log(this.TAG, "buy Zoot");
        return { success: true };
    }

    @Post('createMint')
    async CreateMint() {
        return await this.contractService.createmint();
    }

    @Post('initPresale')
    async initPresale() {
        return await this.contractService.presaleInit();
    }

    @Post('depositToken')
    async depositToken() {
        return await this.contractService.depositToken();
    }

    @Post('showAll')
    async showAll() {
        return await this.contractService.showAll();
    }

    @Post('startPresale')
    async startPresale() {
        return await this.contractService.presaleStart();
    }

    @Get('getTokenMint')
    async getTokenMint() {
        return await this.contractService.getTokenMint();
    }

    @Post('initLimt')
    async initLimit() {
        await this.contractService.updateLimit();
        await this.contractService.updateCapLimit();
        return await this.contractService.updateUserLimit();
    }

    @Get("presalestate")
    async getPresaleState() {
        return await this.contractService.getPresaleState();
    }

}
