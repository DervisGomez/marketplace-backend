const Question = require('../../../domain/entities/Question');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Question(document.toObject ? document.toObject() : document);
    },
    toDto(value) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
