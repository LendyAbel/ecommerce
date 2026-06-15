import { Request, Response } from 'express';
import categoriesServices from '../services/categoriesServices';
import { getParam, normalizeName } from '../../../lib/utils';
import { AppError } from '../../../lib/AppError';

export const getAllCategories = async (_req: Request, res: Response) => {
    const categories = await categoriesServices.getAllCategories();
    res.status(200).json(categories);
};

export const deleteCategory = async (req: Request, res: Response) => {
    const nameParam = getParam(req.params['name']);
    const name = normalizeName(decodeURIComponent(nameParam));
    if (!name || name.trim() === '') {
        throw new AppError('category name is required', 400);
    }

    const deletedCategory = await categoriesServices.deleteCategoryByName(name);
    res.status(200).json(deletedCategory);
};
