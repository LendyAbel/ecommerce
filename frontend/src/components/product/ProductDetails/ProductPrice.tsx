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
            <span className='text-lg font-extrabold text-text'>
                {formatPrice(price)} €
            </span>
        );
    }

    return (
        <div className='flex items-end gap-3'>
            <span className='text-4xl font-extrabold text-text'>
                {formatPrice(price)} €
            </span>
            {priceWithTax && (
                <span className='mb-1 text-sm text-text-60'>
                    {formatPrice(priceWithTax)} € con IVA ({tax}%)
                </span>
            )}
        </div>
    );
};

export default ProductPrice;
