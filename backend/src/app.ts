import express from 'express';
import cookieParser from 'cookie-parser';

import productsRouter from './modules/products/routers/productRouter';
import categoriesRouter from './modules/categories/routers/categoriesRouter';
import authRouter from './modules/auth/routers/authRouter';
import cartRouter from './modules/cart/routers/cartRouter';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
    res.send('hello world');
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);

app.use(errorHandler);

export default app;
