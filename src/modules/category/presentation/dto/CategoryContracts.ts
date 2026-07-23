import type { NextFunction, Response } from 'express';

interface CategoryRequestBody extends Record<string, unknown> {
    _id: string;
    category: string;
    father: number;
    name: string;
    subcategory: unknown[];
}

interface CategoryRequestQuery extends Record<string, string | undefined> {
    _id: string;
}

interface CategoryHttpRequest {
    body: CategoryRequestBody;
    readonly query: CategoryRequestQuery;
    readonly user: {
        readonly _id: string;
    };
}

type CategoryHandler = (
    request: CategoryHttpRequest,
    response: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

export type { CategoryHandler, CategoryHttpRequest, CategoryRequestBody, CategoryRequestQuery };
