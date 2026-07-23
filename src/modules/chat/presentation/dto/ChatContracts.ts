import type { NextFunction, Response } from 'express';
interface ChatBody extends Record<string, unknown> {
    _id: string;
    chat: string;
    image: string;
    message: string;
    user: string;
}
interface ChatHttpRequest {
    body: ChatBody;
    readonly query: { readonly _id?: string; readonly limit: string; readonly skip: string; readonly status?: string };
    readonly token?: string;
    readonly type?: string;
    readonly user: { readonly _id: string };
}
type ChatHandler = (req: ChatHttpRequest, res: Response, next: NextFunction) => Promise<unknown> | unknown;
export type { ChatHandler, ChatHttpRequest };
