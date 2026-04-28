import { Add } from '@mui/icons-material';

interface AddProductButtonProps {
    onClick: () => void;
}

const AddProductButton = ({ onClick }: AddProductButtonProps) => {
    return (
        <button
            type='button'
            onClick={onClick}
            aria-label='Añadir nuevo producto'
            className='fixed right-6 bottom-6 flex items-center gap-2 rounded-full bg-linear-to-r from-[#667eea] to-[#764ba2] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl active:scale-95'
        >
            <Add fontSize='small' />
            Nuevo
        </button>
    );
};

export default AddProductButton;
