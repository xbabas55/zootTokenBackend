import { Injectable } from '@nestjs/common';
import { RedisDatabaseService } from '../database/redis-db';
import { Config, ConfigDocument } from './model/config-shcema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RedisConfigService extends RedisDatabaseService<ConfigDocument> {
  constructor(@InjectModel(Config.name)  model: Model<ConfigDocument>) {
    super(model);
  }
}