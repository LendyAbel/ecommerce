import pino from 'pino';

import { config } from './config';

const isTest = config.NODE_ENV === 'test';
const isProduction = config.NODE_ENV === 'production';

const level = isTest ? 'silent' : config.LOG_LEVEL;

// JSON logs in production, pretty-printed in development, silent under tests so
// the suite output stays clean. Level overridable via LOG_LEVEL.
//
// Production/test use a synchronous destination so buffered logs are never lost
// when the process exits (e.g. during graceful shutdown). Development uses the
// pino-pretty transport for readable output.
export const logger =
    isProduction || isTest
        ? pino({ level }, pino.destination({ sync: true }))
        : pino({
              level,
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      ignore: 'pid,hostname',
                  },
              },
          });
