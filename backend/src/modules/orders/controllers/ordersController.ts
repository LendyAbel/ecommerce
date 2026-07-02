import { Request, Response } from 'express';
import orderServices from '../services/orderServices';
import {
    CreateOrderSchema,
    OrderIdParamSchema,
    OrdersQuerySchema,
    OrderStatusSchema,
} from '../schemas/ordersZodSchema';

export const listOrders = async (req: Request, res: Response) => {
    const filters = OrdersQuerySchema.parse(req.query);
    const { userId } = req.user!;
    const orders = await orderServices.listUserOrders(userId, filters);
    res.status(200).json(orders);
};

export const listAllOrders = async (req: Request, res: Response) => {
    const filters = OrdersQuerySchema.parse(req.query);
    const orders = await orderServices.listAllOrders(filters);
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

    const orderUpdated = await orderServices.updateStatusOrder(orderId, status);

    res.status(200).json(orderUpdated);
};

export const cancelOrder = async (req: Request, res: Response) => {
    const { orderId } = OrderIdParamSchema.parse(req.params);
    const userId = req.user!.userId;

    const orderCancelled = await orderServices.cancelOwnOrder(orderId, userId);

    res.status(200).json(orderCancelled);
};
