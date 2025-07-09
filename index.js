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

// Add a middleware to check database connection
app.use((req, res, next) => {
    // Allow test endpoint and root to work without DB
    if (req.path === '/' || req.path === '/test') {
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

// Add a test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Server is running',
        dbConnected: dbConnected,
        timestamp: new Date().toISOString()
    });
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