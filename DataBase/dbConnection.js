import mongoose from "mongoose";

let isConnected = false; // Track connection status

export const DbConnection = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB with URI:');

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 50000, // Timeout after 50s
        });
        isConnected = true;
        console.log('Database Connected Successfully');
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
    }
};
