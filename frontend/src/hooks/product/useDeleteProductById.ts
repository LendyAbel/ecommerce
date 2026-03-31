import { useMutation } from '@tanstack/react-query';
import productsService from '../../services/products.service';

const useDeleteProductById = () => {
    const {
        mutateAsync: deleteProductById,
        isPending,
        isSuccess,
    } = useMutation({
        mutationFn: (id: string) => productsService.deleteProductById(id),
    });
    return { deleteProductById, isPending, isSuccess };
};

export default useDeleteProductById;
