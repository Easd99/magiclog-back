import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const config = {
  ssl: process.env.STAGE === 'prod',
  extra: {
    ssl: process.env.STAGE === 'prod' ? { rejectUnauthorized: false } : null,
  },
  type: process.env.DB_CONNECTION as any,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logger: 'advanced-console',
  autoLoadEntities: true,
  synchronize: true,
  //dropSchema: true,
};

export default registerAs('typeorm', () => config);
