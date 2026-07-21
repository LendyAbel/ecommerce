import { mutationOptions } from '@tanstack/react-query';

import { logger } from '@/lib/logger';

import type { LocalCartItem } from '../types/cartTypes';
import cartService from './cart.service';

const cartKeys = {
    cart: ['cart'] as const,
    fetch: () => [...cartKeys.cart, 'fetch'] as const,
    add: () => [...cartKeys.cart, 'add'] as const,
    update: () => [...cartKeys.cart, 'update'] as const,
    remove: () => [...cartKeys.cart, 'remove'] as const,
    clear: () => [...cartKeys.cart, 'clear'] as const,
    sync: () => [...cartKeys.cart, 'sync'] as const,
};

export const fetchCartMutationOptions = () =>
    mutationOptions({
        mutationKey: cartKeys.fetch(),
        mutationFn: () => cartService.getCart(),
        onError: error => {
            logger.error('Cart fetch failed: ', error);
        },
    });

export const addToCartMutationOptions = () =>
    mutationOptions({
        mutationKey: cartKeys.add(),
        mutationFn: async ({
            productId,
            quantity = 1,
        }: {
            productId: string;
            quantity?: number;
        }) => await cartService.addItem(productId, quantity),
        onSuccess: data => {
            logger.debug('addMutation: ', data);
        },
    });

export const updateCartMutationOptions = () =>
    mutationOptions({
        mutationKey: cartKeys.update(),
        mutationFn: async ({
            productId,
            quantity = 1,
        }: {
            productId: string;
            quantity: number;
        }) => await cartService.updateItem(productId, quantity),
    });

export const removeCartItemMutationOptions = () =>
    mutationOptions({
        mutationKey: cartKeys.remove(),
        mutationFn: async (productId: string) => {
            return await cartService.removeItem(productId);
        },
        onSuccess: data => {
            logger.debug('removeMutation:', data);
        },
    });

export const clearCartMutationOptions = () =>
    mutationOptions({
        mutationKey: cartKeys.clear(),
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            logger.debug('clearMutation:');
        },
        onError: error => {
            logger.error('Cart fetch failed:', error);
        },
    });

export const syncCartMutationOptions = () =>
    mutationOptions({
        mutationKey: cartKeys.sync(),
        mutationFn: async (localCartItems: LocalCartItem[]) => {
            await Promise.all(
                localCartItems.map(item =>
                    cartService.addItem(item.product.id, item.quantity),
                ),
            );
            return cartService.getCart();
        },
        onError: error => {
            logger.error('Cart sync failed:', error);
        },
    });
