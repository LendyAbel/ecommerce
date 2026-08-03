import { Request, Response } from 'express';

import { getParam } from '../../../lib/utils';
import { AddItemSchema } from '../schemas/wishlistSchemas';
import wishlistService from '../services/wishlistService';

export const getWishlist = async (req: Request, res: Response) => {
    const wishlist = await wishlistService.getOrCreateWishlist(
        req.user!.userId,
    );
    res.status(200).json(wishlist);
};

export const addItem = async (req: Request, res: Response) => {
    const data = AddItemSchema.parse(req.body);
    const wishlist = await wishlistService.addItem(req.user!.userId, data);
    res.status(200).json(wishlist);
};

export const removeItem = async (req: Request, res: Response) => {
    const productId = getParam(req.params['productId']);
    const wishlist = await wishlistService.removeItem(
        req.user!.userId,
        productId,
    );
    res.status(200).json(wishlist);
};

export const checkItem = async (req: Request, res: Response) => {
    const productId = getParam(req.params['productId']);
    const inWishlist = await wishlistService.isInWishlist(
        req.user!.userId,
        productId,
    );
    res.status(200).json({ inWishlist });
};
