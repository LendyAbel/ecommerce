import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
import type { AnyFieldApi } from '@tanstack/react-form';
import z from 'zod';

import type { ImageForm } from '@/features/products/types/productTypes';
import { sxButtonStyle, sxInputStyle } from '@/shared/utils/utils';

type ImagesInputProps = {
    field: AnyFieldApi;
};

const getUrlError = (url: string): string | null => {
    if (!url.trim()) return 'Obligatorio';
    if (!z.url().safeParse(url).success) return 'URL no válida';
    return null;
};

const ImagesInput = ({ field }: ImagesInputProps) => {
    const images: ImageForm[] = field.state.value ?? [];
    const mainIndex = images.findIndex(img => img.isMain);
    const { errors, isTouched } = field.state.meta;
    const fieldError = isTouched ? errors[0]?.message : undefined;

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
        field.handleChange([
            ...images,
            { url: '', isMain: images.length === 0 },
        ]);
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
                        <p className='text-text-38 py-2 text-sm'>
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
                            const urlError = getUrlError(image.url);
                            return (
                                <div
                                    key={index}
                                    className='flex w-full flex-row items-center gap-0.5'
                                >
                                    <TextField
                                        fullWidth
                                        sx={sxInputStyle}
                                        value={image.url}
                                        error={Boolean(urlError)}
                                        helperText={urlError ?? ''}
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
                    {fieldError && (
                        <small className='text-error font-bold'>
                            {fieldError}
                        </small>
                    )}
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
