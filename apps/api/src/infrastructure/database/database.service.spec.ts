import { ConfigService } from '@nestjs/config';

import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  it('stays disabled when bootstrap connection is turned off', async () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue({
        host: '127.0.0.1',
        port: 5432,
        database: 'book_maker',
        username: 'book_maker',
        password: 'book_maker',
        connectOnBootstrap: false,
      }),
    } as unknown as ConfigService;

    const service = new DatabaseService(configService);

    await service.onModuleInit();

    expect(service.getStatus()).toBe('disabled');
  });
});
