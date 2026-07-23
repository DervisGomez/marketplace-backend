import type { NextFunction, Response } from 'express';
interface InvestBody extends Record<string, unknown> {
    hour: string;
}
interface InvestHttpRequest {
    body: InvestBody;
}
type InvestHandler = (req: InvestHttpRequest, res: Response, next: NextFunction) => Promise<unknown> | unknown;
export type { InvestHandler, InvestHttpRequest };
