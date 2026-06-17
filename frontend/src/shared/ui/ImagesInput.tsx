import {
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    Radio,
    RadioGroup,
    TextField,
} from '@mui/material';
import type { ImageForm } from '@/features/products/types/productTypes';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { AnyFieldApi } from '@tanstack/react-form';
import { sxButtonStyle, sxInputStyle } from '@/shared/utils/utils';

type ImagesInputProps = {
    field: AnyFieldApi;
};

const ImagesInput = ({ field }: ImagesInputProps) => {
    const images: ImageForm[] = field.state.value ?? [];
    const mainIndex = images.findIndex(img => img.isMain);

    const handleUrlChange = (index: number, url: string) => {
        const updated = images.map((img, i) =>
            i === index ? { ...img, url } : img,
        );
        field.handleChange(updated);
    };

    const handleRadioChange = (index: number) => {
        const updated = images.map((img, i) => ({
            ...img,
            isMain: i === index,
        }));
        field.handleChange(updated);
    };

    const handleAdd = () => {
        field.handleChange([...images, { url: '', isMain: false }]);
    };

    const handleRemove = (index: number) => {
        const imagesWithoutDeleted = images.filter((_, i) => i !== index);
        const imagesHasMain = imagesWithoutDeleted.some(img => img.isMain);
        const imagesWithMainChanged =
            !imagesHasMain && imagesWithoutDeleted.length > 0
                ? imagesWithoutDeleted.map((img, i) => ({
                      ...img,
                      isMain: i === 0,
                  }))
                : imagesWithoutDeleted;

        field.handleChange(imagesWithMainChanged);
    };
    const hasImages = images.length > 0;

    return (
        <div className={`flex items-center ${hasImages ? 'gap-0.5' : ''}`}>
            {hasImages && (
                <FormControl fullWidth sx={sxInputStyle}>
                    <FormLabel id='radio-label'>Images</FormLabel>
                    {images.length === 0 && (
                        <p className='py-2 text-sm text-text-38'>
                            No images. Add one
                        </p>
                    )}
                    <RadioGroup
                        value={mainIndex === -1 ? '' : String(mainIndex)}
                        onChange={e =>
                            handleRadioChange(Number(e.target.value))
                        }
                    >
                        {images?.map((image, index) => {
                            return (
                                <div key={image.url} className='flex w-full flex-row items-center gap-0.5'>
                                    <TextField
                                        fullWidth
                                        sx={sxInputStyle}
                                        value={image.url}
                                        onChange={e =>
                                            handleUrlChange(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <FormControlLabel
                                        control={<Radio size='small' />}
                                        label='Principal'
                                        value={String(index)}
                                        sx={{ minWidth: 'max-content' }}
                                    />

                                    <span>
                                        <IconButton
                                            size='small'
                                            color='error'
                                            onClick={() => handleRemove(index)}
                                        >
                                            <DeleteOutlineIcon fontSize='small' />
                                        </IconButton>
                                    </span>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </FormControl>
            )}

            <div className={hasImages ? 'flex w-53 flex-row' : 'w-full'}>
                <Button
                    className='h-14 w-full min-w-max'
                    variant={'outlined'}
                    onClick={handleAdd}
                    sx={sxButtonStyle}
                >
                    Add Image
                </Button>
            </div>
        </div>
    );
};

export default ImagesInput;
