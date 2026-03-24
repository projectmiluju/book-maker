import { ConfigService } from '@nestjs/config';

import { RedisService } from './redis.service';

describe('RedisService', () => {
  it('stays disabled when bootstrap connection is turned off', async () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue({
        host: '127.0.0.1',
        port: 6379,
        db: 0,
        connectOnBootstrap: false,
      }),
    } as unknown as ConfigService;

    const service = new RedisService(configService);

    await service.onModuleInit();

    expect(service.getStatus()).toBe('disabled');
  });
});
