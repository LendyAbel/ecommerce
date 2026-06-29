import { Request, Response } from 'express';
import addressServices from '../services/addressServices';
import {
    AddressIdParamSchema,
    CreateAddressSchema,
    UpdateAddressSchema,
} from '../schemas/addressSchemas';

export const listAddresses = async (req: Request, res: Response) => {
    const addresses = await addressServices.listAddresses(req.user!.userId);
    res.status(200).json({ addresses });
};

export const createAddress = async (req: Request, res: Response) => {
    const data = CreateAddressSchema.parse(req.body);
    const address = await addressServices.createAddress(req.user!.userId, data);
    res.status(201).json(address);
};

export const updateAddress = async (req: Request, res: Response) => {
    const { id } = AddressIdParamSchema.parse(req.params);
    const data = UpdateAddressSchema.parse(req.body);
    const address = await addressServices.updateAddress(
        req.user!.userId,
        id,
        data,
    );
    res.status(200).json(address);
};

export const deleteAddress = async (req: Request, res: Response) => {
    const { id } = AddressIdParamSchema.parse(req.params);
    await addressServices.deleteAddress(req.user!.userId, id);
    res.status(204).send();
};
