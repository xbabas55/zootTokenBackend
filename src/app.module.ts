import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GalleryController } from './gallery/gallery.controller';
import { TokenomicsController } from './tokenomics/tokenomics.controller';

@Module({
  imports: [],
  controllers: [AppController, GalleryController, TokenomicsController],
  providers: [AppService],
})
export class AppModule {}
