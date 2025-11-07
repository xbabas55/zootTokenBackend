import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GalleryController } from './gallery/gallery.controller';
import { TokenomicsController } from './tokenomics/tokenomics.controller';
import { SolanaService } from './solana/solana.service';
import { ConfigModule } from '@nestjs/config';

@Module({
   imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes env variables available everywhere
      envFilePath: '.env', // optional, defaults to '.env'
    }),
  ],
  controllers: [AppController, GalleryController, TokenomicsController],
  providers: [AppService, SolanaService],
})
export class AppModule {}
