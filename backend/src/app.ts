import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { config } from './lib/config';
import { prisma } from './lib/prisma';

import productsRouter from './modules/products/routers/productRouter';
import categoriesRouter from './modules/categories/routers/categoriesRouter';
import authRouter from './modules/auth/routers/authRouter';
import usersRouter from './modules/users/routers/usersRouter';
import cartRouter from './modules/cart/routers/cartRouter';
import ordersRouter from './modules/orders/routers/ordersRouter';

import { errorHandler } from './middlewares/errorHandler';
import { authLimiter, generalLimiter } from './middlewares/rateLimiters';
import { httpLogger } from './middlewares/httpLogger';

const app = express();

const FRONTEND_URL = config.FRONTEND_URL;

app.use(httpLogger);
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/', (_req, res) => {
    res.send('hello world');
});

app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok', db: 'up' });
    } catch {
        res.status(503).json({ status: 'error', db: 'down' });
    }
});

app.use('/api', generalLimiter);

// Límite estricto contra fuerza bruta antes de montar el router de auth.
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

app.use(errorHandler);

export default app;
