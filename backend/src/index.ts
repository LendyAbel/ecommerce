import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT ?? 3001;

const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`API Auth:         http://localhost:${PORT}/api/auth`);
    logger.info(`API Products:     http://localhost:${PORT}/api/products`);
    logger.info(`API Categories:   http://localhost:${PORT}/api/categories`);
    logger.info(`API Cart:         http://localhost:${PORT}/api/cart`);
});

// Force-exit if a graceful shutdown stalls (e.g. a hung connection never closes).
const SHUTDOWN_TIMEOUT_MS = 10_000;

let shuttingDown = false;

const gracefulShutdown = async (signal: string) => {
    if (shuttingDown) return; // ignore repeated signals
    shuttingDown = true;

    logger.info(`${signal} received, shutting down gracefully`);

    const forceExit = setTimeout(() => {
        logger.error('Could not close connections in time, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
        // Stop accepting new connections and wait for in-flight requests.
        await new Promise<void>((resolve, reject) => {
            server.close(err => (err ? reject(err) : resolve()));
        });
        await prisma.$disconnect();
        logger.info('Shutdown complete');
        process.exit(0);
    } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
    }
};

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

process.on('unhandledRejection', reason => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
    void gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', err => {
    // The process is in an undefined state; log and exit so a supervisor restarts it.
    logger.fatal({ err }, 'Uncaught exception');
    process.exit(1);
});
