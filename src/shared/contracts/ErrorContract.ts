interface LegacyCastError {
    readonly kind: string;
    readonly message?: string;
    readonly name: string;
    readonly path: string;
    readonly reason?: Readonly<{ name?: string }>;
    readonly stringValue: string;
    readonly value: unknown;
}

interface LegacyValidationError {
    readonly errors: Readonly<Record<string, LegacyCastError>>;
    readonly message?: string;
    readonly name: 'ValidationError';
}

interface LegacyMongoError {
    readonly code?: number;
    readonly codeName?: string;
    readonly errmsg?: string;
    readonly message?: string;
    readonly name: 'MongoError' | 'MongoServerError';
    readonly ok?: number;
}

type LegacyErrorData = string | Readonly<Record<string, unknown>> | readonly unknown[];

export type { LegacyCastError, LegacyErrorData, LegacyMongoError, LegacyValidationError };
