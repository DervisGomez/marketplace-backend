const Buy = require('../../../domain/entities/Buy');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Buy(document.toObject ? document.toObject() : document);
    },
    toDto(value) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
