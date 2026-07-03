import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';

const handleZodError = (error: unknown, res: Response): boolean => {
    if (!(error instanceof ZodError)) return false;

    res.status(400).json({
        error: 'Validation error',
        issues: error.issues,
    });
    return true;
};

const handlePrismaError = (error: unknown, res: Response): boolean => {
    //Known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002': {
                //Unique constraint
                const cause = (
                    error.meta?.driverAdapterError as {
                        cause?: { constraint?: { fields?: string[] } };
                    }
                )?.cause;
                const fields = cause?.constraint?.fields?.join(', ');
                res.status(409).json({
                    error: 'Already exists',
                    fields: fields,
                });
                return true;
            }

            case 'P2025': //Record not found
                res.status(404).json({ error: 'Record not found' });
                return true;

            case 'P2003': // Foreign key constraint
                res.status(409).json({ error: 'Related record not found' });
                return true;
        }
    }

    //Validation Prisma errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        res.status(400).json({ error: 'Invalid data' });
        return true;
    }

    //Uknown Prisma errors
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        res.status(500).json({
            error: 'Database error',
            message: error.message,
        });
        return true;
    }

    return false;
};

export const errorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    if (handleZodError(error, res)) return;
    if (handlePrismaError(error, res)) return;

    if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }

    // req.log is attached by pino-http and carries the request-id; fall back to
    // the base logger if the request logger is unavailable.
    (req.log ?? logger).error({ err: error }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
};
