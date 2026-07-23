import type { NextFunction, Response } from 'express';

interface UserRequestBody extends Record<string, unknown> {
    $pull?: Readonly<Record<string, unknown>>;
    _id: string;
    birthdate: string;
    code: string;
    codeRegister: string;
    day: number;
    email: string;
    identification: string;
    month: number;
    password: string;
    passwordConfirmed: string;
    passwordNew: string;
    phone: string;
    photo: string;
    photoDocument: string;
    token: string;
    userName: string;
}

interface UserRequestQuery extends Record<string, string | undefined> {
    _id?: string;
    date?: string;
    limit: string;
    linkInvitation?: string;
    skip: string;
}

interface UserIdentity extends Record<string, unknown> {
    readonly _id: string;
    readonly email: string;
    readonly name: string;
    readonly phone: string;
}

interface UserHttpRequest {
    body: UserRequestBody;
    readonly query: UserRequestQuery;
    readonly token?: string;
    readonly user: UserIdentity;
}

type UserServiceHandler = (
    request: UserHttpRequest,
    response: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

interface MappableDocument extends Record<string, unknown> {
    readonly toObject?: () => Record<string, unknown>;
}

declare global {
    namespace NodeJS {
        interface Global {
            config: {
                readonly token: {
                    readonly bcrypt_salt_rounds: number;
                    readonly days: number;
                };
            };
        }
    }

    var config: {
        readonly url: {
            readonly web: string;
        };
        readonly token: {
            readonly bcrypt_salt_rounds: number;
            readonly days: number;
        };
    };

    var RandString: {
        readonly create: (length: number) => string;
    };
    var userData: unknown;
}

export type { MappableDocument, UserHttpRequest, UserIdentity, UserRequestBody, UserRequestQuery, UserServiceHandler };
