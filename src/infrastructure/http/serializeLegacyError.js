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

function serializeLegacyError(error) {
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
    if (error && error.name === 'MongoError' && !serialized.errmsg) {
        serialized.errmsg = error.message;
    }
    return serialized;
}

module.exports = serializeLegacyError;
