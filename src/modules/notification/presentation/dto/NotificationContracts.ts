import type { NextFunction, Response } from 'express';

interface NotificationHttpRequest {
    body: Record<string, unknown> & { _id: string };
    readonly user: Readonly<{ _id: string }>;
}

type NotificationHandler = (
    request: NotificationHttpRequest,
    response: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

export type { NotificationHandler, NotificationHttpRequest };
