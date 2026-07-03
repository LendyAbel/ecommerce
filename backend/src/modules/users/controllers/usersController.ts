import { Request, Response } from 'express';

import { getParam } from '../../../lib/utils';
import usersServices from '../services/usersServices';

// Admin-only: list all active users.
export const listUsers = async (_req: Request, res: Response) => {
    const users = await usersServices.listUsers();
    res.status(200).json({ users });
};

// Admin-only: soft-delete a user from the users list.
export const deleteUser = async (req: Request, res: Response) => {
    const userId = getParam(req.params['id']);
    await usersServices.softDeleteUser(userId);
    res.status(204).send();
};
