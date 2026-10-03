import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected successfully");
};

export default connectDB;