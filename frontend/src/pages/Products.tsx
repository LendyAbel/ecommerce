import ProductCard from '../components/product/ProductCard';
import type { Product } from '../types/productTypes';
import useProducts from '../hooks/product/useProducts';
import AddProductButton from '../components/product/AddProductButton';
import useNewProductDialog from '../hooks/product/useNewProductDialog';
import NewProductDialog from '../components/product/NewProductDialog';
import ProductCardSkeleton from '../components/product/Skeletons/ProductCardSkeleton';
import ProductFilters from '../components/product/ProductFilters';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import useCategory from '../hooks/category/useCategory';
import type { SortBy } from '../services/products.service';
import { useDebounce } from '../utils/utils';

const Products = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('newest');

    const debouncedSearch = useDebounce(searchQuery, 350);

    const { products, isProductsError, isProductsLoading } = useProducts({
        search: debouncedSearch,
        category: selectedCategory,
        sortBy,
    });
    const userRole = useAuthStore(state => state.user?.role);
    const newProductDialog = useNewProductDialog();

    const { categories } = useCategory();
    const categoriesList = categories.map(c => c.name);

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
                    <section className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </section>
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
