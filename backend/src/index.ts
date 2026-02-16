import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(console.error);
