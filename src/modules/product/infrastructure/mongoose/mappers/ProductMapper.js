const Product = require('../../../domain/entities/Product');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Product(document.toObject ? document.toObject() : document);
    },
    toDto(value) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
