// lib/db.ts (COMPLETE VERSION)
import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function connectDB(): Promise<void> {
  if (connection.isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable');
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    
    connection.isConnected = db.connections[0].readyState;
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Export as default
export default connectDB;