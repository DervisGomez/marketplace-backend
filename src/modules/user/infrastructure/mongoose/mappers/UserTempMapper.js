const UserTemp = require('../../../domain/entities/UserTemp');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new UserTemp(document.toObject ? document.toObject() : document);
    }
};
