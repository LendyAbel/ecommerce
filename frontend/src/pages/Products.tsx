import { useMemo, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCategories } from '@/features/categories/hooks/useCategory';
import AddProductButton from '@/features/products/components/AddProductButton';
import NewProductDialog from '@/features/products/components/NewProductDialog';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters from '@/features/products/components/ProductFilters';
import ProductCardSkeleton from '@/features/products/components/skeletons/ProductCardSkeleton';
import {
    useNewProductDialog,
    useProducts,
} from '@/features/products/hooks/useProduct';
import type {
    Product,
    SortBy,
} from '@/features/products/schemas/productSchemas';
import { EmptyState, ErrorState, PageContainer } from '@/shared/components';
import { useDebounce } from '@/shared/hooks';
import { Button } from '@/shared/ui';

const Products = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('newest');

    const debouncedSearch = useDebounce(searchQuery, 350);

    const {
        products,
        isError,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useProducts({
        search: debouncedSearch,
        category: selectedCategory,
        sortBy,
    });
    const userRole = useAuthStore(state => state.user?.role);
    const newProductDialog = useNewProductDialog();

    const { categories } = useCategories();
    // Memoizado para no crear un array nuevo en cada render (p.ej. al teclear),
    // lo que rompería la memoización de ProductFilters / Select.
    const categoriesList = useMemo(
        () => categories.map(c => c.name),
        [categories],
    );

    if (isLoading) {
        return (
            <PageContainer maxWidth='6xl'>
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </PageContainer>
        );
    }

    if (isError) {
        return (
            <PageContainer maxWidth='6xl'>
                <ErrorState message='No pudimos cargar los productos. Inténtalo de nuevo en unos instantes.' />
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth='6xl'>
            <ProductFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categoriesList}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {products.length === 0 ? (
                <EmptyState
                    title='Sin resultados'
                    message='No hay productos que coincidan con tu búsqueda.'
                />
            ) : (
                <>
                    <section className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </section>

                    {hasNextPage && (
                        <div className='mt-8 flex justify-center'>
                            <Button
                                variant='outline'
                                loading={isFetchingNextPage}
                                onClick={() => fetchNextPage()}
                            >
                                Cargar más
                            </Button>
                        </div>
                    )}
                </>
            )}

            {userRole === 'admin' && (
                <AddProductButton onClick={newProductDialog.open} />
            )}
            <NewProductDialog
                isOpen={newProductDialog.isOpen}
                onClose={newProductDialog.close}
            />
        </PageContainer>
    );
};

export default Products;
