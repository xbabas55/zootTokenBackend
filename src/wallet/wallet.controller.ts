import { Controller, Get, Param, Post, HttpException, HttpStatus, Delete, HttpCode } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {

  constructor(private readonly historyService: WalletService) { }

  // GET /history  → all incoming transactions
  @Get()
  async getAll() {
    return await this.historyService.findAll();
  }

  // GET /history/:wallet → history for a specific sender wallet
  @Get(':wallet')
  async getBySender(@Param('wallet') wallet: string) {
    let result = await this.historyService.findBySender(wallet);

    return result;
  }

  @Post("distribute")
  async distributeTokens() {
    try {
      const result = await this.historyService.distributeTokensToAllUsers();
      return { success: true, result };
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  async clearEverything() {
    return this.historyService.clearAllHistoryAndDistribution();
  }
}
