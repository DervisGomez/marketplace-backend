const Increment = require('../../../domain/entities/Increment');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Increment(document.toObject ? document.toObject() : document);
    }
};
