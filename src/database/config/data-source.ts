import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export let dataSourceOptions: DataSourceOptions;

const commonOptions: DataSourceOptions = {
  type: 'postgres',
  logging: process.env.DB_LOGGING === 'true',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [
    __dirname + '/../migrations/**/*.ts',
    __dirname + '/../seeders/**/*.ts',
  ],
  synchronize: process.env.DB_SYNC === 'true',
  ssl: { rejectUnauthorized: false },
};

if (process.env.DATABASE_URL) {
  dataSourceOptions = {
    ...commonOptions,
    url: process.env.DATABASE_URL,
  };
} else {
  dataSourceOptions = {
    ...commonOptions,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
