import {} from 'express';

declare module 'express' {
    interface Request {
        user?: { userId: string; role: string };
    }
}
