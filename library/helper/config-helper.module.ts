import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisConfigService } from './config-helper';
import { Config, ConfigSchema } from './model/config-shcema';
import { RedisModule } from '../database/redius.module';

@Module({
  imports: [
    RedisModule, // import shared Redis provider
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
  ],
  providers: [RedisConfigService],
  exports: [RedisConfigService],
})
export class RConfigModule {}