const ProductCardSkeleton = () => {
    return (
        <div className='flex flex-col overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]'>
            <div className='h-48 w-full animate-pulse bg-white/10' />
            <div className='flex flex-col gap-2 p-4'>
                <div className='h-4 w-3/4 animate-pulse rounded bg-white/10' />
                <div className='h-3 w-full animate-pulse rounded bg-white/[0.07]' />
                <div className='h-3 w-4/5 animate-pulse rounded bg-white/[0.07]' />
                <div className='mt-1 flex items-center justify-between'>
                    <div className='h-5 w-16 animate-pulse rounded bg-white/10' />
                    <div className='h-5 w-20 animate-pulse rounded-full bg-white/[0.07]' />
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
