import { memo } from 'react';

const formatPrice = (price: string | number) =>
    parseFloat(String(price)).toFixed(2);

type ProductPriceProps = {
    price: number;
    tax?: number;
    compact?: boolean;
};

const ProductPrice = ({ price, tax, compact = false }: ProductPriceProps) => {
    const priceWithTax = tax ? price * (1 + tax / 100) : null;

    if (compact) {
        return (
            <span className='text-text text-lg font-extrabold'>
                {formatPrice(price)} €
            </span>
        );
    }

    return (
        <div className='flex items-end gap-3'>
            <span className='text-text text-4xl font-extrabold'>
                {formatPrice(price)} €
            </span>
            {priceWithTax && (
                <span className='text-text-60 mb-1 text-sm'>
                    {formatPrice(priceWithTax)} € con IVA ({tax}%)
                </span>
            )}
        </div>
    );
};

export default memo(ProductPrice);
