const Message = require('../../../domain/entities/Message');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Message(document.toObject ? document.toObject() : document);
    }
};
