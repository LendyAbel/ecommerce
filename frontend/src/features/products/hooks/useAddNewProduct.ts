import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProductForm } from '@/features/products/types/productTypes';
import productsService from '@/features/products/api/products.service';
import { logger } from '@/lib/logger';
import { notify } from '@/shared/store/alertStore';

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
            notify.success('Producto añadido correctamente')
        },
        onError: error => {
            logger.error('Error al crear producto:', error);
            notify.error('Error al añadir producto')
        },
    });
    return { addNewProduct, isPending, isError };
};
export default useAddNewProduct;
