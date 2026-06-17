const ProductCardSkeleton = () => {
    return (
        <div className='flex flex-col overflow-hidden rounded-2xl border border-border bg-surface'>
            <div className='skeleton h-48 w-full rounded-none' />
            <div className='flex flex-col gap-2 p-4'>
                <div className='skeleton h-4 w-3/4' />
                <div className='skeleton h-3 w-full' />
                <div className='skeleton h-3 w-4/5' />
                <div className='mt-1 flex items-center justify-between'>
                    <div className='skeleton h-5 w-16' />
                    <div className='skeleton h-5 w-20 rounded-full' />
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
