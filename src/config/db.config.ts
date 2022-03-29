require('dotenv').config();

const dbConfig = {
  DB: process.env.DB,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
};

export { dbConfig };
