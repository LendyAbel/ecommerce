import ProductCard from '@/features/products/components/ProductCard';
import type { Product } from '@/features/products/types/productTypes';
import useProducts from '@/features/products/hooks/useProducts';
import AddProductButton from '@/features/products/components/AddProductButton';
import useNewProductDialog from '@/features/products/hooks/useNewProductDialog';
import NewProductDialog from '@/features/products/components/NewProductDialog';
import ProductCardSkeleton from '@/features/products/components/skeletons/ProductCardSkeleton';
import ProductFilters from '@/features/products/components/ProductFilters';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMemo, useState } from 'react';
import useCategory from '@/features/categories/hooks/useCategory';
import type { SortBy } from '@/features/products/api/products.service';
import { useDebounce } from '@/shared/utils/utils';
import { Button } from '@/shared/ui';

const Products = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('newest');

    const debouncedSearch = useDebounce(searchQuery, 350);

    const {
        products,
        isProductsError,
        isProductsLoading,
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

    const { categories } = useCategory();
    // Memoizado para no crear un array nuevo en cada render (p.ej. al teclear),
    // lo que rompería la memoización de ProductFilters / Select.
    const categoriesList = useMemo(
        () => categories.map(c => c.name),
        [categories],
    );

    if (isProductsLoading) {
        return (
            <div className='bg-bg relative min-h-[calc(100vh-48px)]'>
                <div className='m-auto w-[90%] max-w-6xl pt-4'>
                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isProductsError) {
        return (
            <div className='bg-bg flex min-h-[calc(100vh-48px)] items-start'>
                <p className='text-error m-auto mt-20 text-center'>
                    Error al cargar los productos
                </p>
            </div>
        );
    }

    return (
        <div className='bg-bg relative min-h-[calc(100vh-48px)]'>
            <div className='m-auto mt-4 w-[90%] max-w-6xl'>
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
                    <p className='text-text-38 py-12 text-center'>
                        No hay productos que coincidan con tu búsqueda.
                    </p>
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
            </div>

            {userRole === 'admin' && (
                <AddProductButton onClick={newProductDialog.open} />
            )}
            <NewProductDialog
                isOpen={newProductDialog.isOpen}
                onClose={newProductDialog.close}
            />
        </div>
    );
};

export default Products;
