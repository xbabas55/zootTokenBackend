import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { WalletHistory, WalletHistorySchema } from './schemas/wallet-history.schema';
import { TokenDistribution, TokenDistributionSchema } from './schemas/token-distribution.schema';

@Module({
   imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: WalletHistory.name, schema: WalletHistorySchema },
      { name: TokenDistribution.name, schema: TokenDistributionSchema}
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
