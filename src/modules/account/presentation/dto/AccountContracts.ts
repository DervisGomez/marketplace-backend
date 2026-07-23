import type { NextFunction, Response } from 'express';
interface AccountBody extends Record<string, unknown> {
    _id: string;
    user: string;
}
interface AccountHttpRequest {
    body: AccountBody;
    readonly query: { readonly _id?: string };
    readonly user: { readonly _id: string };
}
type AccountHandler = (req: AccountHttpRequest, res: Response, next: NextFunction) => Promise<unknown> | unknown;
export type { AccountHandler, AccountHttpRequest };
