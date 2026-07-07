import { useMutation, useQueryClient } from '@tanstack/react-query';

import productsService from '../api/products.service';

const useDeleteProductById = () => {
    const queryClient = useQueryClient();
    const {
        mutateAsync: deleteProductById,
        isPending,
        isSuccess,
    } = useMutation({
        mutationKey: ['deleteProduct'],
        mutationFn: (id: string) => productsService.deleteProductById(id),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['products'] }),
                queryClient.invalidateQueries({ queryKey: ['categories'] }),
            ]);
        },
    });
    return { deleteProductById, isPending, isSuccess };
};

export default useDeleteProductById;
