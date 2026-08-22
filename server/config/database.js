import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);

        // Connection event handlers
        mongoose.connection.on('connected', () => {
            logger.info('Database Connected Successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Connect with retry logic and proper options
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in the environment variables");
        }

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
}

export default connectDB;