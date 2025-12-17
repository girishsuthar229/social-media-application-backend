import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export let dataSourceOptions: DataSourceOptions;

if (process.env.DATABASE_URL) {
  dataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: process.env.DB_LOGGING === 'true',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    migrations: [
      __dirname + '/../migrations/**/*.ts',
      __dirname + '/../seeders/**/*.ts',
    ],
    synchronize: process.env.DB_SYNC === 'true',
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: process.env.DB_LOGGING === 'true',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    migrations: [
      __dirname + '/../migrations/**/*.ts',
      __dirname + '/../seeders/**/*.ts',
    ],
    synchronize: process.env.DB_SYNC === 'true',
    ssl: {
      rejectUnauthorized: false,
    },
  };
}
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
