import mongoose from "mongoose"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

const dbConnect = async () => {
  try {
    const mongoURI = process.env.MONGO_URI

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables.")
    }

    await mongoose.connect(mongoURI)
    console.log("✅ Successfully connected to MongoDB")
  } 
  catch (err) {
    console.error("❌ MongoDB connection error:", err)
    
    // Optional: force exit on failure
    process.exit(1) 
  }
}

export default dbConnect
