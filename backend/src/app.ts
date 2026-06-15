import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { prisma } from './lib/prisma';
import productsRouter from './modules/products/routers/productRouter';
import categoriesRouter from './modules/categories/routers/categoriesRouter';
import authRouter from './modules/auth/routers/authRouter';
import cartRouter from './modules/cart/routers/cartRouter';
import { errorHandler } from './middlewares/errorHandler';
import { authLimiter, generalLimiter } from './middlewares/rateLimiters';
import { httpLogger } from './middlewares/httpLogger';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

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
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);

app.use(errorHandler);

export default app;
