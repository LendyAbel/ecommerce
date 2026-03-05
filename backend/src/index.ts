import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.get('/', (_req, res) => {
    res.send('hello world');
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log('Server running');
    console.log(`http://localhost:${PORT}`);
});
