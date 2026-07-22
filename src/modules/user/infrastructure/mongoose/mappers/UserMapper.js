const User = require('../../../domain/entities/User');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        const data = document.toObject ? document.toObject() : document;
        return new User(data);
    },
    toDto(value) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
