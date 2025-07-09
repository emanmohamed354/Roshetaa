import { DbConnection } from './DataBase/dbConnection.js'
import userRouter from './src/modules/user/user.router.js'
import { productRouter } from './src/modules/product/product.router.js'
import { cartRouter } from './src/modules/cart/cart.router.js'
import { wishlistRouter } from './src/modules/wishlist/wishlist.router.js'
import {orderRouter} from './src/modules/order/order.router.js'
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import paymentRouter from './src/modules/payment/payment.router.js';
import { PaymobWebhookRouter } from './src/modules/paymobWebhook/paymobWebhook.router.js'
import altRouter from './src/modules/alt/alt.router.js';

dotenv.config();
const app = express()

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Also use cors middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// At the top of your file, modify the database connection call
let dbConnected = false;

// Connect to database with error handling
const connectDatabase = async () => {
    try {
        await DbConnection();
        dbConnected = true;
    } catch (error) {
        console.error('Failed to connect to database:', error);
        dbConnected = false;
    }
};

// Call it immediately
connectDatabase();

// Update the database check middleware
app.use((req, res, next) => {
    // Allow test endpoints to work without DB
    if (req.path === '/' || req.path === '/test' || req.path === '/test-db' || req.path === '/env-check') {
        return next();
    }
    
    if (!dbConnected) {
        return res.status(503).json({ 
            error: 'Service temporarily unavailable',
            message: 'Database connection not established'
        });
    }
    
    next();
});
app.get('/env-check', (req, res) => {
    const mongoUri = process.env.MONGODB_URI;
    res.json({
        hasMongoUri: !!mongoUri,
        mongoUriLength: mongoUri ? mongoUri.length : 0,
        uriPreview: mongoUri ? mongoUri.substring(0, 30) + '...' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY'))
    });
});

app.get('/test', async (req, res) => {
    // Try to connect if not connected
    if (!dbConnected) {
        try {
            await connectDatabase();
        } catch (error) {
            console.error('Test endpoint DB connection attempt failed:', error);
        }
    }
    
    res.json({ 
        message: 'Server is running',
        dbConnected: dbConnected,
        mongooseState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});
app.get('/test-db', async (req, res) => {
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        return res.status(500).json({
            success: false,
            error: 'MONGODB_URI not found in environment variables',
            env: process.env.NODE_ENV
        });
    }
    
    try {
        // Set a short timeout for testing
        mongoose.set('bufferTimeoutMS', 5000);
        
        console.log('Attempting connection to MongoDB...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });
        
        res.json({
            success: true,
            message: 'Database connection successful!',
            state: mongoose.connection.readyState
        });
        
        // Disconnect after test
        await mongoose.disconnect();
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code,
            name: error.name
        });
    }
});
app.get('/test-db-simple', async (req, res) => {
    // Set immediate timeout for response
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).json({
                error: 'Connection attempt timed out after 8 seconds',
                hint: 'Check MongoDB Atlas Network Access settings'
            });
        }
    }, 8000);

    try {
        const { MongoClient } = await import('mongodb');
        const uri = process.env.MONGODB_URI;
        
        // Parse the connection string to check components
        const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
        if (!match) {
            clearTimeout(timeout);
            return res.status(400).json({ error: 'Invalid MongoDB URI format' });
        }

        const [, username, password, cluster, database] = match;
        
        console.log('Connection details:', {
            username,
            cluster,
            database,
            hasPassword: !!password
        });

        // Try a simple connection with MongoClient
        const client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });

        console.log('Attempting to connect...');
        await client.connect();
        console.log('Connected successfully!');
        
        // Try to ping
        await client.db().admin().ping();
        
        clearTimeout(timeout);
        res.json({
            success: true,
            message: 'Connection successful!',
            cluster: cluster,
            database: database
        });

        await client.close();
    } catch (error) {
        clearTimeout(timeout);
        console.error('Connection error:', error);
        
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code,
            errorName: error.name,
            hint: error.message.includes('authentication') ? 
                'Check username/password' : 
                'Check MongoDB Atlas Network Access (IP Whitelist)'
        });
    }
});
app.get('/test-encoded-password', (req, res) => {
    const uri = process.env.MONGODB_URI;
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
    
    if (match) {
        const [, username, password] = match;
        const encodedPassword = encodeURIComponent(password);
        
        res.json({
            currentPassword: password,
            needsEncoding: password !== encodedPassword,
            encodedPassword: encodedPassword,
            suggestedUri: password !== encodedPassword ? 
                `mongodb+srv://${username}:${encodedPassword}@cluster0.mnfstos.mongodb.net/Pharmacy?retryWrites=true&w=majority` :
                'Password encoding looks correct'
        });
    } else {
        res.json({ error: 'Could not parse URI' });
    }
});
// Logging middleware
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

// Routes
app.use('/users', userRouter)
app.use('/products', productRouter)
app.use('/carts', cartRouter)
app.use('/wishlist', wishlistRouter)
app.use('/payment', paymentRouter);
app.use('/orders', orderRouter)
app.use('/pay', PaymobWebhookRouter)
app.use('/alternatives', altRouter);  

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API', status: 'running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Export for Vercel
export default app;