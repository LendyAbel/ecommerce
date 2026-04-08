import { Card, CardContent, CardHeader, Skeleton } from '@mui/material';

const ProductCardSkeleton = () => {
  return (
      <Card variant={'outlined'} className='flex flex-col p-1'>
          <CardHeader title={<Skeleton animation={'wave'} width={'60%'} />} />
          <CardContent>
              <Skeleton variant='rectangular' height={200} />
              <Skeleton sx={{ mt: 1 }} />
              <Skeleton width='80%' />
              <div className='mt-2 flex justify-between'>
                  <Skeleton width={80} height={32} />
                  <Skeleton width={100} height={32} />
              </div>
          </CardContent>
      </Card>
  );
}

export default ProductCardSkeleton