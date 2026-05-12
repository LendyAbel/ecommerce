import { useMutation, useQueryClient } from '@tanstack/react-query';
import productsService from '../../services/products.service';

const useDeleteProductById = () => {
    const queryClient = useQueryClient();
    const {
        mutateAsync: deleteProductById,
        isPending,
        isSuccess,
    } = useMutation({
        mutationFn: (id: string) => productsService.deleteProductById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
    return { deleteProductById, isPending, isSuccess };
};

export default useDeleteProductById;
