const ProductDetailsSkeleton = () => {
    return (
        <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
            <div className='skeleton h-105 rounded-2xl' />

            <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-2'>
                    <div className='skeleton h-4 w-1/2' />
                    <div className='skeleton h-8 w-3/4' />
                </div>

                <div className='skeleton h-10 w-32' />

                <hr className='border-border' />

                <div className='flex flex-col gap-2'>
                    <div className='skeleton h-4 w-full' />
                    <div className='skeleton h-4 w-5/6' />
                </div>

                <div className='flex flex-col gap-2'>
                    <div className='skeleton h-3 w-full' />
                    <div className='skeleton h-3 w-4/5' />
                    <div className='skeleton h-3 w-full' />
                </div>

                <hr className='border-border' />

                <div className='skeleton h-5 w-24 rounded-full' />

                <div className='flex gap-2'>
                    <div className='skeleton h-6 w-20 rounded-full' />
                    <div className='skeleton h-6 w-20 rounded-full' />
                </div>

                <div className='flex items-center gap-3 pt-2'>
                    <div className='skeleton h-11 flex-1 rounded-xl' />
                    <div className='skeleton size-11 rounded-xl' />
                    <div className='skeleton size-11 rounded-xl' />
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;
