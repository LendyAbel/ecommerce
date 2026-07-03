import { Request, Response } from 'express';

import { getParam } from '../../../lib/utils';
import { AddItemSchema, UpdateItemSchema } from '../schemas/cartZodSchema';
import cartServices from '../services/cartServices';

export const getCart = async (req: Request, res: Response) => {
    const cart = await cartServices.getOrCreateCart(req.user!.userId);
    res.status(200).json(cart);
};

export const addItem = async (req: Request, res: Response) => {
    const data = AddItemSchema.parse(req.body);
    const cart = await cartServices.addItem(req.user!.userId, data);
    res.status(200).json(cart);
};

export const updateItem = async (req: Request, res: Response) => {
    const itemId = getParam(req.params['itemId']);
    const data = UpdateItemSchema.parse(req.body);
    const cart = await cartServices.updateItem(req.user!.userId, itemId, data);
    res.status(200).json(cart);
};

export const removeItem = async (req: Request, res: Response) => {
    const itemId = getParam(req.params['itemId']);
    const cart = await cartServices.removeItem(req.user!.userId, itemId);
    res.status(200).json(cart);
};

export const clearCart = async (req: Request, res: Response) => {
    const cart = await cartServices.clearCart(req.user!.userId);
    res.status(200).json(cart);
};
