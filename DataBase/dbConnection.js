import mongoose from "mongoose";

let isConnected = false;

export const DbConnection = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    const mongoUri = process.env.MONGODB_URI;
    
    // Add detailed logging
    console.log('Environment check:', {
        hasMongoUri: !!mongoUri,
        nodeEnv: process.env.NODE_ENV,
        uriPrefix: mongoUri ? mongoUri.substring(0, 20) + '...' : 'undefined'
    });

    if (!mongoUri) {
        console.error('MONGODB_URI is not defined in environment variables');
        throw new Error('Database configuration error');
    }

    try {
        console.log('Starting MongoDB connection attempt...');
        
        mongoose.set('debug', true); // Enable mongoose debug mode
        
        const opts = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(mongoUri, opts);
        
        isConnected = true;
        console.log('✅ Database Connected Successfully');
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

    } catch (error) {
        console.error('❌ Database connection failed:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        isConnected = false;
        throw error;
    }
};