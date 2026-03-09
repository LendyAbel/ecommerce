import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import productsRouter from './products/routers/productRouter';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    res.send('hello world');
});

app.use('/api/products', productsRouter);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log('Server running');
    console.log(`http://localhost:${PORT}`);
});
