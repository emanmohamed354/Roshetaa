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
DbConnection()

// Configure CORS properly
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-frontend.vercel.app', // Replace with your actual frontend URL
      // Add more origins as needed
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  optionsSuccessStatus: 200
};

// Apply middleware (remove duplicates)
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    res.send('Welcome to the API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Use process.env.PORT for Vercel
const port = process.env.PORT || 3000;

// For Vercel, we need to export the app
export default app;

// Only listen if not in production (Vercel handles this)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}