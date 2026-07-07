import { Spinner } from '@/shared/ui';

type GeneralLoaderProps = {
    label?: string;
};

const GeneralLoader = ({ label = 'Cargando' }: GeneralLoaderProps) => (
    <div
        className='bg-surface/70 fixed inset-0 z-100 flex items-center justify-center backdrop-blur-sm'
        role='alertdialog'
        aria-busy='true'
        aria-live='assertive'
        aria-label={label}
    >
        <Spinner className='text-primary size-12' label={label} />
    </div>
);

export default GeneralLoader;
