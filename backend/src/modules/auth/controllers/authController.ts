import { Request, Response } from 'express';
import { LoginSchema, RegisterSchema } from '../schemas/authZodSchema';
import authServices from '../services/authServices';
import { AppError } from '../../../lib/AppError';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response) => {
    const data = RegisterSchema.parse(req.body);
    const user = await authServices.register(data);
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
    const token = req.cookies?.token;
    if (!token) throw new AppError('No authenticated', 401);

    const data = await authServices.getLoggedUser(token);
    res.json(data);
};
