import { AppError } from './AppError';

export const normalizeName = (value: string): string => {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

export const getParam = (param: string | string[] | undefined): string => {
    if (!param || Array.isArray(param))
        throw new AppError('Invalid parameter', 400);
    return param;
};
