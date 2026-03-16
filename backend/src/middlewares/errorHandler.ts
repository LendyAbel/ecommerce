import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../lib/AppError';

const zodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
        res.status(400).json({
            error: 'Validation error',
            issues: error.issues,
        });
    }
    return;
};

const prismaError = (error: unknown, res: Response) => {
    //Known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002': //Unique constraint
                res.status(409).json({
                    error: 'Already exists',
                    field: error.meta?.target,
                });
                return;

            case 'P2025': //Record not found
                res.status(404).json({ error: 'Record not found' });
                return;

            case 'P2003': // Foreign key constraint
                res.status(409).json({ error: 'Related record not found' });
                return;
        }
    }

    //Validation Prisma errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        res.status(400).json({ error: 'Invalid data' });
        return;
    }

    //Uknown Prisma errors
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        res.status(500).json({
            error: 'Database error',
            message: error.message,
        });
        return;
    }
};

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    zodError(error, res);

    prismaError(error, res);

    if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }

    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
};
