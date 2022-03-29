require('dotenv').config();
import mongoose from 'mongoose';
import { dbConfig } from './config/db.config';
import { app } from './app';

const start = async () => {
  try {
    await mongoose.connect(`mongodb://${dbConfig.DB_HOST}:${dbConfig.DB_PORT}/${dbConfig.DB}`);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.error('MongoDB connection error', err);
  }

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log(`Gateway Auth is listening on port ${PORT}`);
  });
};

start();
