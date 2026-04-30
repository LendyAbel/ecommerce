import express from "express"
import { authenticate } from '../../../middlewares/authMiddleware';
import cartServices from '../services/cartServices';
import { AddItemSchema, UpdateItemSchema } from '../schemas/cartZodSchema';
import { getParam } from '../../../lib/utils';

const router = express.Router()
router.use(authenticate)

router.get('/', async (req, res) => {
    const cart = await cartServices.getOrCreateCart(req.user!.userId);
    res.status(200).json(cart);
});

router.post('/items', async (req, res) => {
    const data = AddItemSchema.parse(req.body);
    const cart = await cartServices.addItem(req.user!.userId, data);
    res.status(200).json(cart);
});

router.patch('/items/:itemId', async (req, res) => {
    const itemId = getParam(req.params['itemId']);
    const data = UpdateItemSchema.parse(req.body);
    const cart = await cartServices.updateItem(req.user!.userId, itemId, data);
    res.status(200).json(cart);
});

router.delete('/items/:itemId', async (req, res) => {
    const itemId = getParam(req.params['itemId']);
    const cart = await cartServices.removeItem(req.user!.userId, itemId);
    res.status(200).json(cart);
});

router.delete('/', async (req, res) => {
    const cart = await cartServices.clearCart(req.user!.userId);
    res.status(200).json(cart);
});

export default router;