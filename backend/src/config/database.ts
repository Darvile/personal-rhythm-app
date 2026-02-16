import mongoose from 'mongoose';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  // Reuse existing connection in Lambda warm starts
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse';

  try {
    await mongoose.connect(uri, {
      // Lambda-optimized settings
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB error:', error);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    isConnected = false;
  });
}
