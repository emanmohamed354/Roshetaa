import mongoose from "mongoose";

let isConnected = false;

export const DbConnection = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.error('MONGODB_URI is not defined in environment variables');
        throw new Error('Database configuration error');
    }

    console.log('Attempting to connect to MongoDB...');

    try {
        const opts = {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
        };

        await mongoose.connect(mongoUri, opts);
        
        isConnected = true;
        console.log('Database Connected Successfully');
        
        // Add connection event handlers
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

    } catch (error) {
        console.error('Error connecting to the database:', error);
        isConnected = false;
        throw error; // Re-throw to handle in the main app
    }
};