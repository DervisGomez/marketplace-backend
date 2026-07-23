import type { NextFunction, Request, Response } from 'express';

interface BuyPaymentItem {
    readonly amount: number;
    readonly type: string;
}

interface BuyRequestBody extends Record<string, unknown> {
    month: number;
    number: number;
    payment: readonly BuyPaymentItem[];
    percent: string;
    year: number;
}

interface BuyHttpRequest extends Request {
    body: BuyRequestBody;
}

type BuyHandler = (request: BuyHttpRequest, response: Response, next: NextFunction) => Promise<unknown> | unknown;

export type { BuyHandler, BuyHttpRequest, BuyPaymentItem, BuyRequestBody };
