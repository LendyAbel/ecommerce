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
            await queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
    return { addNewProduct, isPending, isError };
};
export default useAddNewProduct;
