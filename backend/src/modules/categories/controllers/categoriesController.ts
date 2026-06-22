import { Request, Response } from 'express';
import categoriesServices from '../services/categoriesServices';
import { getParam } from '../../../lib/utils';
import { CategoryNameParamSchema } from '../schemas/categoriesZodSchema';

export const getAllCategories = async (_req: Request, res: Response) => {
    const categories = await categoriesServices.getAllCategories();
    res.status(200).json(categories);
};

export const deleteCategory = async (req: Request, res: Response) => {
    const name = CategoryNameParamSchema.parse(getParam(req.params['name']));

    const deletedCategory = await categoriesServices.deleteCategoryByName(name);
    res.status(200).json(deletedCategory);
};
