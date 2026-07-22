const Code = require('../../../domain/entities/Code');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Code(document.toObject ? document.toObject() : document);
    }
};
