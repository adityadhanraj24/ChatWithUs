import mongoose from "mongoose";
import dns from "dns";

export const connectDB = async () => {
  try {
    // Explicitly set DNS servers to resolve MongoDB Atlas SRV records in environments with restrictive DNS
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    dns.setDefaultResultOrder("ipv4first");
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};