import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'SM_nest',
  logging: true,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [
    __dirname + '/../migrations/**/*.ts',
    __dirname + '/../seeders/**/*.ts',
  ],
  synchronize: process.env.DB_SYNC === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
