import { Request, Response } from 'express';

import { AppError } from '../../../lib/AppError';
import { config } from '../../../lib/config';
import usersServices from '../../users/services/usersServices';
import { LoginSchema, RegisterSchema } from '../schemas/authSchemas';
import authServices from '../services/authServices';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response) => {
    const data = RegisterSchema.parse(req.body);
    const { token, user } = await authServices.register(data);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user });
};

export const login = async (req: Request, res: Response) => {
    const data = LoginSchema.parse(req.body);
    const { token, user } = await authServices.login(data);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ user });
};

export const logout = (_req: Request, res: Response) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.status(200).json({ message: 'Logged out' });
};

export const me = async (req: Request, res: Response) => {
    // The `authenticate` middleware verifies the JWT and sets req.user.
    if (!req.user) throw new AppError('Authentication required', 401);

    const data = await authServices.getUserById(req.user.userId);
    res.json(data);
};

// Authenticated user soft-deletes their own account, then we clear the auth cookie.
export const deleteMe = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required', 401);

    await usersServices.softDeleteUser(req.user.userId);
    res.clearCookie('token', COOKIE_OPTIONS);
    res.status(204).send();
};
