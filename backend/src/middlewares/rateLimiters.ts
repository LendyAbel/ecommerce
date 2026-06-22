import rateLimit from 'express-rate-limit';
import { config } from '../lib/config';

const skipInTest = () => config.NODE_ENV === 'test';

// Límite general suave para toda la API.
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: 'Too many requests, please try again later' },
});

// Límite estricto contra fuerza bruta en endpoints de autenticación.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: 'Too many attempts, please try again later' },
});
