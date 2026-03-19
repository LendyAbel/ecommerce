//------- helpers
//------------------------

const formatPrice = (price: string | number) =>
    parseFloat(String(price)).toFixed(2);

//------- component
//-----------------------
type ProductPriceProps = {
    price: number;
    tax?: number;
};

const ProductPrice = ({ price, tax }: ProductPriceProps) => {
    const priceWithTax = tax ? price * (1 + tax / 100) : null;

    return (
        <div className='flex items-end gap-3'>
            <span className='text-4xl font-extrabold text-gray-900'>
                {formatPrice(price)} €
            </span>
            {priceWithTax && (
                <span className='mb-1 text-sm text-gray-400'>
                    {formatPrice(priceWithTax)} € con IVA ({tax}%)
                </span>
            )}
        </div>
    );
};

export default ProductPrice;
