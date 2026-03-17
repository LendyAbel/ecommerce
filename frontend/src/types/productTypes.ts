export interface Product {
    brand: string,
    categories?: Array<Category>
    id: string,
    images?: Array<Image>
    longDescription?: string
    mainCategory?: Category
    name: string
    price: number
    shortDescription: string
    sku: string
    status?: 'published' | 'discontinued' | 'draft'
    stock: number
    tax: number
}

export interface Category {
    id: string,
    name: string
}

export interface Image {
    id: string,
    url: string,
    isMain: boolean
}