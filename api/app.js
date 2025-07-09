import { DbConnection } from '../DataBase/dbConnection.js'
import userRouter from '../src/modules/user/user.router.js'
import { productRouter } from '../src/modules/product/product.router.js'
import { cartRouter } from '../src/modules/cart/cart.router.js'
import { wishlistRouter } from '../src/modules/wishlist/wishlist.router.js'
import {orderRouter} from '../src/modules/order/order.router.js'
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import paymentRouter from '../src/modules/payment/payment.router.js';
import { PaymobWebhookRouter } from '../src/modules/paymobWebhook/paymobWebhook.router.js'
import altRouter from '../src/modules/alt/alt.router.js';
import app from '../index.js';

dotenv.config();
const app = express()

// CORS configuration - MUST be before any routes
app.use(cors({
    origin: ['http://localhost:3000', 'https://rosheta-web-git-main-eman-mohammeds-projects-b6f9bb20.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
DbConnection()

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

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`App listening on port ${port}!`));
}