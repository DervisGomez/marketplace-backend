import type { NextFunction, Request, Response } from 'express';

interface PaymentRequestBody extends Record<string, unknown> {
    amount: string;
}

interface PaymentHttpRequest extends Request {
    body: PaymentRequestBody;
}

type PaymentHandler = (
    request: PaymentHttpRequest,
    response: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

export type { PaymentHandler, PaymentHttpRequest, PaymentRequestBody };
