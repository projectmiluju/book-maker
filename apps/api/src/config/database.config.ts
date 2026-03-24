import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.POSTGRES_HOST ?? '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB ?? 'book_maker',
  username: process.env.POSTGRES_USER ?? 'book_maker',
  password: process.env.POSTGRES_PASSWORD ?? 'book_maker',
  connectOnBootstrap: process.env.POSTGRES_CONNECT_ON_BOOTSTRAP !== 'false',
}));
