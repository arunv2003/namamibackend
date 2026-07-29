import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST?.trim();
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME?.trim();
console.log('DB CONFIG:', {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  database: dbName,
});

const isLocalhost = dbHost === 'localhost' || dbHost === '127.0.0.1';
const useSSL = process.env.DB_SSL === 'true' || (!isLocalhost && process.env.DB_SSL !== 'false');

export const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},

    logging: console.log,

    connectTimeout: 10000,

    pool: {
      max: 10,
      min: 0,
      acquire: 10000,
      idle: 10000,
    },
  }
);


export const connectDB = async () => {
  try {
    console.log('⏳ Connecting to MySQL...');

    await sequelize.authenticate();

    console.log('✅ Database connected successfully.');

    // Initialize model associations
    const { setupAssociations } = await import('../models/index.js');
    setupAssociations();

    await sequelize.sync();

    console.log('✅ Database models synchronized.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed gracefully.');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};
