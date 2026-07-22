const Notification = require('../../../domain/entities/Notification');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Notification(document.toObject ? document.toObject() : document);
    },
    toDto(value) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
