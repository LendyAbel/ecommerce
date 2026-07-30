import jwt from 'jsonwebtoken';

import { config } from '../../../lib/config';
import { User } from '../../users/schemas/userSchemas';

type getTokenType = {
    userId: User['id'];
    role: User['role'];
};

export const getToken = ({ userId, role }: getTokenType) => {
    return jwt.sign({ userId, role }, config.JWT_SECRET, { expiresIn: '7d' });
};
