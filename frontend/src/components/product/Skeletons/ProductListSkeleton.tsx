import { Chip, Divider, Skeleton } from '@mui/material';

const ProductListSkeleton = () => {
    return (
        <div className='mx-auto w-[90%] max-w-5xl py-10'>
            <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                <Skeleton
                    variant='rectangular'
                    height={420}
                    sx={{ borderRadius: 2 }}
                />
                <div className='flex flex-col gap-5'>
                    <div>
                        <Skeleton height={21} />
                        <Skeleton height={45} />
                    </div>
                    <div className='flex items-end gap-3'>
                        <Skeleton height={54} width={100} />
                        <Skeleton height={21} width={'80%'} />
                    </div>
                    <Divider />
                    <Skeleton variant={'text'} height={21} />
                    <div>
                        <Skeleton variant={'text'} height={21} />
                        <Skeleton variant={'text'} height={21} />
                    </div>
                    <Divider />
                    <div className='flex flex-wrap gap-2'>
                        <Chip label={<Skeleton width={40} />} />
                        <Chip label={<Skeleton width={40} />} />
                    </div>
                    <div className='flex items-center gap-3 pt-2'>
                        <Skeleton width={'80%'} height={80} />
                        <Skeleton variant={'circular'} width={50} height={50} />
                        <Skeleton variant={'circular'} width={50} height={50} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListSkeleton;
