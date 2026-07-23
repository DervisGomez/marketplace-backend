import mongoose = require('mongoose');

type JsonObject = Record<string, unknown>;

interface LegacyCastError {
    kind: string;
    message?: string;
    name: string;
    path: string;
    reason?: { name?: string };
    stringValue: string;
    value: unknown;
}

interface ValidationErrorLike {
    errors: Record<string, LegacyCastError>;
    message?: string;
    name: 'ValidationError';
}

interface MongoErrorLike {
    code?: number;
    codeName?: string;
    errmsg?: string;
    message?: string;
    name: 'MongoError' | 'MongoServerError';
    ok?: number;
}

function clone<T>(value: unknown): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function removeValueType(message?: string): string | undefined {
    return message?.replace(/ \(type [^)]+\)/, '');
}

function serializeCastError(error: LegacyCastError): JsonObject {
    const serialized = clone<JsonObject>(error);
    serialized.message = removeValueType(error.message);
    delete serialized.valueType;

    if (error.reason?.name === 'AssertionError') {
        const kind = String(error.kind).toLowerCase();
        serialized.reason = {
            stringValue: error.stringValue,
            kind,
            value: error.value,
            path: error.path,
            reason: undefined,
            name: 'CastError',
            message: `Cast to ${kind} failed for value ${error.stringValue} at path "${error.path}"`
        };
    }

    return serialized;
}

function isValidationError(error: unknown): error is ValidationErrorLike {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError';
}

function isMongoError(error: unknown): error is MongoErrorLike {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error.name === 'MongoError' || error.name === 'MongoServerError')
    );
}

function serializeLegacyError(error: unknown, collectionName?: string): unknown {
    if (isValidationError(error)) {
        const serialized = clone<JsonObject>(error);
        serialized.message = removeValueType(error.message);
        serialized.errors = Object.fromEntries(
            Object.entries(error.errors).map(([path, nestedError]) => [
                path,
                nestedError.name === 'CastError' ? serializeCastError(nestedError) : clone(nestedError)
            ])
        );
        return serialized;
    }

    if (isMongoError(error)) {
        let errmsg = error.errmsg || error.message || '';
        if (error.code === 27 && collectionName && !errmsg.includes('no such collection')) {
            const databaseName = mongoose.connection.name;
            errmsg += ` (no such collection '${databaseName}.${collectionName}')`;
        }
        return {
            name: 'MongoError',
            code: error.code,
            codeName: error.codeName,
            errmsg,
            ok: error.ok === undefined ? 0 : error.ok
        };
    }

    return clone(error);
}

export = serializeLegacyError;
