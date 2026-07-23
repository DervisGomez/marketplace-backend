function removeValueType(message) {
    return message && message.replace(/ \(type [^)]+\)/, '');
}

function serializeCastError(error) {
    const serialized = JSON.parse(JSON.stringify(error));
    serialized.message = removeValueType(error.message);
    delete serialized.valueType;

    if (error.reason && error.reason.name === 'AssertionError') {
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

function serializeLegacyError(error, collectionName) {
    if (error && error.name === 'ValidationError') {
        const serialized = JSON.parse(JSON.stringify(error));
        serialized.message = removeValueType(error.message);
        serialized.errors = Object.fromEntries(
            Object.entries(error.errors).map(([path, nestedError]) => [
                path,
                nestedError.name === 'CastError'
                    ? serializeCastError(nestedError)
                    : JSON.parse(JSON.stringify(nestedError))
            ])
        );
        return serialized;
    }

    const serialized = JSON.parse(JSON.stringify(error));
    if (error && (error.name === 'MongoError' || error.name === 'MongoServerError')) {
        let errmsg = error.errmsg || error.message;
        if (error.code === 27 && collectionName && !errmsg.includes('no such collection')) {
            const databaseName = require('mongoose').connection.name;
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
    return serialized;
}

module.exports = serializeLegacyError;
