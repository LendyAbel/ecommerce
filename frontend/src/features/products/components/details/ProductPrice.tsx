import { memo } from 'react';

import { formatCurrency } from '@/shared/utils/format';

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
                {formatCurrency(price)} €
            </span>
        );
    }

    return (
        <div className='flex items-end gap-3'>
            <span className='text-text text-4xl font-extrabold'>
                {formatCurrency(price)} €
            </span>
            {priceWithTax && (
                <span className='text-text-60 mb-1 text-sm'>
                    {formatCurrency(priceWithTax)} € con IVA ({tax}%)
                </span>
            )}
        </div>
    );
};

export default memo(ProductPrice);
