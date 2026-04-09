import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

import productsRouter from './modules/products/routers/productRouter';
import categoriesRouter from './modules/categories/routers/categoriesRouter';
import authRouter from './modules/auth/routers/authRouter';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser())

app.get('/', (_req, res) => {
    res.send('hello world');
});

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
    console.log('Server running');
    console.log(`http://localhost:${PORT}`);
    console.log(`API Products: http://localhost:${PORT}/api/products`);
    console.log(`API Categories: http://localhost:${PORT}/api/categories`);
});
