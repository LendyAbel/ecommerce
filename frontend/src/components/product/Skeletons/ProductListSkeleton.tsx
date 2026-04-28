const ProductListSkeleton = () => {
    return (
        <div className='mx-auto w-[90%] max-w-5xl py-10'>
            <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                <div className='h-105 animate-pulse rounded-2xl bg-white/10' />

                <div className='flex flex-col gap-5'>
                    <div className='flex flex-col gap-2'>
                        <div className='h-4 w-1/2 animate-pulse rounded bg-white/10' />
                        <div className='h-8 w-3/4 animate-pulse rounded bg-white/10' />
                    </div>

                    <div className='h-10 w-32 animate-pulse rounded bg-white/10' />

                    <hr className='border-white/10' />

                    <div className='flex flex-col gap-2'>
                        <div className='h-4 w-full animate-pulse rounded bg-white/[0.07]' />
                        <div className='h-4 w-5/6 animate-pulse rounded bg-white/[0.07]' />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <div className='h-3 w-full animate-pulse rounded bg-white/[0.07]' />
                        <div className='h-3 w-4/5 animate-pulse rounded bg-white/[0.07]' />
                        <div className='h-3 w-full animate-pulse rounded bg-white/[0.07]' />
                    </div>

                    <hr className='border-white/10' />

                    <div className='h-5 w-24 animate-pulse rounded-full bg-white/[0.07]' />

                    <div className='flex gap-2'>
                        <div className='h-6 w-20 animate-pulse rounded-full bg-white/[0.07]' />
                        <div className='h-6 w-20 animate-pulse rounded-full bg-white/[0.07]' />
                    </div>

                    <div className='flex items-center gap-3 pt-2'>
                        <div className='h-11 flex-1 animate-pulse rounded-xl bg-white/10' />
                        <div className='h-11 w-11 animate-pulse rounded-xl bg-white/[0.07]' />
                        <div className='h-11 w-11 animate-pulse rounded-xl bg-white/[0.07]' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListSkeleton;
