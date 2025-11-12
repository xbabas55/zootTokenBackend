import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global() // ✅ Makes it available globally (no need to re-import everywhere)
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        // You can configure this as needed
        const client = new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        });

        // Optionally, check connection
        client.on('connect', () => console.log('✅ Redis connected'));
        client.on('error', (err) => console.error('❌ Redis error:', err));

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'], // ✅ make it injectable
})
export class RedisModule {}
