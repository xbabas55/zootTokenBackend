import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { SolanaService } from '../solana/solana.service';

@Controller('tokenomics')
export class TokenomicsController {
    constructor(private readonly solanaService: SolanaService) { }

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
}
