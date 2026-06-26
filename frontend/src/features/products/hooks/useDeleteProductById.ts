import { useMutation, useQueryClient } from '@tanstack/react-query';
import productsService from '@/features/products/api/products.service';
import { notify } from '@/shared/store/alertStore';

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
            notify.info('Producto eliminado');
        },
    });
    return { deleteProductById, isPending, isSuccess };
};

export default useDeleteProductById;
