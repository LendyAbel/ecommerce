import { Request, Response } from 'express';
import orderServices from '../services/orderServices';
import {
    CreateOrderSchema,
    OrderIdParamSchema,
    OrderStatusSchema,
} from '../schemas/ordersZodSchema';

export const listOrders = async (req: Request, res: Response) => {
    const orders = await orderServices.listOrders(req.user!.userId);
    res.status(200).json(orders);
};

export const listAllOrders = async (_req: Request, res: Response) => {
    const orders = await orderServices.listAllOrders();
    res.status(200).json(orders);
};

export const getOrder = async (req: Request, res: Response) => {
    const { orderId } = OrderIdParamSchema.parse(req.params);
    const { userId, role } = req.user!;

    const order = await orderServices.getOrderbyId(orderId, userId, role);

    res.status(200).json(order);
};

export const createOrder = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const data = CreateOrderSchema.parse(req.body);

    const order = await orderServices.createOrder(userId, data);
    res.status(201).json(order);
};

export const updateStatusOrder = async (req: Request, res: Response) => {
    const { orderId } = OrderIdParamSchema.parse(req.params);
    const { status } = OrderStatusSchema.parse(req.body);

    const orderUpdated = await orderServices.updateStatusOrder(
        orderId,
        status,
    );

    res.status(200).json(orderUpdated);
};
