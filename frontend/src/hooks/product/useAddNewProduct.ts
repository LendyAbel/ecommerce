import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProductForm } from '../../types/productTypes';
import productsService from '../../services/products.service';

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
            console.log(error);
        },
    });
    return { addNewProduct, isPending, isError };
};
export default useAddNewProduct;
