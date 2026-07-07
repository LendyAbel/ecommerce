import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';

import productsService from '../api/products.service';
import type { ProductForm } from '../schemas/productZodSchema';

const useAddNewProduct = () => {
    const queryClient = useQueryClient();
    const {
        mutateAsync: addNewProduct,
        isPending,
        isError,
    } = useMutation({
        mutationFn: (newProductData: ProductForm) =>
            productsService.addNewProduct(newProductData),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['products'] }),
                queryClient.invalidateQueries({ queryKey: ['categories'] }),
            ]);
        },
        onError: error => {
            logger.error('Error al crear producto:', error);
        },
    });
    return { addNewProduct, isPending, isError };
};
export default useAddNewProduct;
