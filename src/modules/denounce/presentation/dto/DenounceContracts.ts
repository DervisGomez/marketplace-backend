import type { NextFunction, Response } from 'express';
interface DenounceBody extends Record<string, unknown> {
    accuser: string;
    question: string;
}
interface DenounceHttpRequest {
    body: DenounceBody;
    readonly token?: string;
    readonly user: { readonly _id: string };
}
type DenounceHandler = (req: DenounceHttpRequest, res: Response, next: NextFunction) => Promise<unknown> | unknown;
export type { DenounceHandler, DenounceHttpRequest };
