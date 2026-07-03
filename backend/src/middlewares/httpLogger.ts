import pinoHttp from 'pino-http';

import { logger } from '../lib/logger';

// Per-request logging: assigns a request-id (req.id), exposes a request-scoped
// logger (req.log) and logs each completed request. /health is ignored to avoid
// noise from uptime probes.
export const httpLogger = pinoHttp({
    logger,
    autoLogging: {
        ignore: req => req.url === '/health',
    },
});
