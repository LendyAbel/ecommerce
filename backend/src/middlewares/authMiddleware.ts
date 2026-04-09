import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/AppError';

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const token = req.cookies.token as string | undefined;
    if (!token) throw new AppError('Authentication required', 401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: string;
        };
        req.user = decoded;
        next();
    } catch {
        throw new AppError('Invalid or expired token', 401);
    }
};

export const requireAdmin = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    if (req.user?.role !== 'admin') throw new AppError('Unauthorized', 403);
    next();
};
