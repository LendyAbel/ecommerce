import { Alert } from '@mui/material';
import ProductCard from '../components/product/ProductCard';
import type { Product } from '../types/productTypes';
import useProducts from '../hooks/product/useProducts';
import AddProductButton from '../components/product/AddProductButtom';
import useNewProductDialog from '../hooks/product/useNewProductDialog';
import NewProductDialog from '../components/product/NewProductDialog';
import ProductCardSkeleton from '../components/product/Skeletons/ProductCardSkeleton';
import ProductFilters from '../components/product/ProductFilters';
import { useAuthStore } from '../store/authStore';
import { useMemo, useState } from 'react';

const Products = () => {
    const { products, isProductsError, isProductsLoading } = useProducts();
    const userRole = useAuthStore(state => state.user?.role);
    const { isOpen, open, close } = useNewProductDialog();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = useMemo(() => {
        if (!products) return [];
        const cats = new Set<string>();
        products.forEach(p => {
            if (p.mainCategory?.name) cats.add(p.mainCategory.name);
            p.categories?.forEach(c => cats.add(c.name));
        });
        return Array.from(cats).sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.shortDescription.toLowerCase().includes(q);
            const matchesCategory =
                !selectedCategory ||
                p.mainCategory?.name === selectedCategory ||
                p.categories?.some(c => c.name === selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    // --- loading ------------------------------
    if (isProductsLoading) {
        return (
            <div className='m-auto mt-4 w-[90%] max-w-6xl'>
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }
    // --- error --------------------------------
    if (isProductsError) {
        return (
            <div className='m-auto w-[80%]'>
                <Alert severity='error'>Error loading products</Alert>
            </div>
        );
    }

    return (
        <div className='relative min-h-screen'>
            <div className='m-auto mt-4 w-[90%] max-w-6xl'>
                <ProductFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    categories={categories}
                />

                {filteredProducts.length === 0 ? (
                    <p className='py-12 text-center text-gray-400'>
                        No hay productos que coincidan con tu búsqueda.
                    </p>
                ) : (
                    <section className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        {filteredProducts.map((product: Product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </section>
                )}
            </div>

            {userRole === 'admin' && <AddProductButton onClick={open} />}
            <NewProductDialog isOpen={isOpen} onClose={close} />
        </div>
    );
};

export default Products;
