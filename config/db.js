import mongoose from 'mongoose';

let cached = global._mongoConnection ?? null;

export const connectDB = async () =>
{
  if (cached && mongoose.connection.readyState === 1) return cached;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  cached = await mongoose.connect(uri);
  global._mongoConnection = cached;
  console.log('✅ MongoDB connected');
  return cached;
};
