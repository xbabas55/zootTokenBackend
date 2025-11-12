import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GalleryController } from './gallery/gallery.controller';
import { TokenomicsController } from './tokenomics/tokenomics.controller';
import { SolanaService } from './solana/solana.service';
import { ConfigModule } from '@nestjs/config';
import { ContractService } from './contract/contract.service';
import { Library } from 'library/library';
import { MongooseModule } from '@nestjs/mongoose';


import { RConfigModule } from 'library/helper/config-helper.module';
import { RedisModule } from 'library/database/redius.module';

@Module({
   imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes env variables available everywhere
      envFilePath: '.env', // optional, defaults to '.env'
    }),
     Library,
    MongooseModule.forRoot('mongodb://localhost:27017'),
    RedisModule,
    RConfigModule,
  ],
  controllers: [AppController, GalleryController, TokenomicsController],
  providers: [AppService, SolanaService, ContractService],
})
export class AppModule {}
