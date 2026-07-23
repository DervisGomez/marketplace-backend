import type { NextFunction, Response } from 'express';
interface BankBody extends Record<string, unknown> {
    _id: string;
    image: string;
}
interface BankHttpRequest {
    body: BankBody;
    readonly query: { readonly _id?: string };
}
type BankHandler = (req: BankHttpRequest, res: Response, next: NextFunction) => Promise<unknown> | unknown;
export type { BankHandler, BankHttpRequest };
