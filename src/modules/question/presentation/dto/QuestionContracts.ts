import type { NextFunction, Response } from 'express';

interface QuestionRequestBody extends Record<string, unknown> {
    _id: string;
    answerAt: Date;
    client: string;
    question: string;
    status: number;
    user: string;
}

interface QuestionRequestQuery extends Record<string, string | undefined> {
    _id: string;
    client: string;
    date: string;
    limit: string;
    product: string;
    skip: string;
    user: string;
}

interface QuestionHttpRequest {
    body: QuestionRequestBody;
    readonly query: QuestionRequestQuery;
    readonly token?: string;
    readonly user: Readonly<{ _id: string }>;
}

type QuestionHandler = (
    request: QuestionHttpRequest,
    response: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

export type { QuestionHandler, QuestionHttpRequest, QuestionRequestBody, QuestionRequestQuery };
