import { Injectable, Inject } from '@nestjs/common';
import { Model, Document } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';

export interface ICacheDatabaseService<T extends Document> {
  getByKey(key: string): Promise<T | null>;
  set(key: string, data: Partial<T>): Promise<T>;
  update(key: string, data: Partial<T>): Promise<T | null>;
  delete(key: string): Promise<boolean>;
}

/**
 * RedisDatabaseService — handles both MongoDB (persistent) and Redis (cache).
 * Every document is stored in MongoDB and also cached in Redis.
 */
@Injectable()
export class RedisDatabaseService<T extends Document> implements ICacheDatabaseService<T> {
  private redis: Redis;

  constructor(
    @InjectModel('') private readonly model: Model<T>, // overridden in subclass
    @Inject('REDIS_CLIENT') redisClient?: Redis,
  ) {
    this.redis = redisClient || new Redis();
  }

  private getCacheKey(key: string) {
    // unified key format
    return `${this.model.modelName}:${key}`;
  }

  /**
   * Get document by key (from Redis cache if possible, else MongoDB)
   */
  async getByKey(key: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(key);

    // Try Redis first
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as T;

    // Try MongoDB by `key` field (if exists)
    const doc = await this.model.findOne({ key }).lean();
    if (doc) {
      await this.redis.set(cacheKey, JSON.stringify(doc), 'EX', 3600);
    }
    return doc as T | null;
  }

  /**
   * Set a new key/value (creates or updates MongoDB + Redis)
   */
  async set(key: string, data: Partial<T>): Promise<T> {
    // Try to find existing
    let doc = await this.model.findOne({ key });
    if (doc) {
      Object.assign(doc, data);
      await doc.save();
    } else {
      doc = await this.model.create({ ...data, key } as any);
    }

    const cacheKey = this.getCacheKey(key);
    await this.redis.set(cacheKey, JSON.stringify(doc.toObject()), 'EX', 3600);
    return doc;
  }

  /**
   * Update existing data (MongoDB + Redis)
   */
  async update(key: string, data: Partial<T>): Promise<T | null> {
    const updated = await this.model
      .findOneAndUpdate({ key }, data, { new: true, lean: true })
      .exec();

    const cacheKey = this.getCacheKey(key);
    if (updated) {
      await this.redis.set(cacheKey, JSON.stringify(updated), 'EX', 3600);
    } else {
      await this.redis.del(cacheKey);
    }

    return updated as T | null;
  }

  /**
   * Delete from MongoDB + Redis
   */
  async delete(key: string): Promise<boolean> {
    const deleted = await this.model.findOneAndDelete({ key });
    const cacheKey = this.getCacheKey(key);
    await this.redis.del(cacheKey);
    return !!deleted;
  }
}