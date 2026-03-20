export interface Product {
    brand: string;
    categories?: Array<Category>;
    id: string;
    images?: Array<Image>;
    longDescription?: string;
    mainCategory?: Category;
    name: string;
    price: number;
    shortDescription: string;
    sku: string;
    status?: ProductStatus;
    stock: number;
    tax: number;
}

export interface Category {
    id: string;
    name: string;
}

export interface Image {
    id: string;
    url: string;
    isMain: boolean;
}

export type ProductStatus = 'published' | 'draft' | 'discontinued';

export type NewProduct = Omit<Product, 'id'>;

export type NewProductForm = Omit<
    NewProduct,
    'mainCategory' | 'categories' | 'images'
> & {
    mainCategory: string;
    categories: string[];
    images: Omit<Image, 'id'>[];
};
