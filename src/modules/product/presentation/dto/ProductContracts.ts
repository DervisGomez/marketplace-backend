import type { NextFunction, Response } from 'express';

interface ProductRequestBody extends Record<string, unknown> {
    _id: string;
    city: string;
    department: string;
    images: string[];
    imagesDelete: string[];
    imagesNew: string[];
    month: number;
    number: number;
    user: string;
    year: number;
}

interface ProductRequestQuery extends Record<string, string | undefined> {
    _id: string;
    category: string;
    city: string;
    condition: string;
    department: string;
    keywords: string;
    limit: string;
    max: string;
    min: string;
    number: string;
    search: string;
    skip: string;
    status: string;
    subcategory: string;
    user: string;
}

interface ProductHttpRequest {
    body: ProductRequestBody;
    readonly query: ProductRequestQuery;
    readonly token?: string;
    readonly user: {
        readonly _id: string;
        readonly city: string;
        readonly department: string;
        readonly favorite: readonly string[];
    };
}

type ProductHandler = (
    request: ProductHttpRequest,
    response: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

export type { ProductHandler, ProductHttpRequest, ProductRequestBody, ProductRequestQuery };
