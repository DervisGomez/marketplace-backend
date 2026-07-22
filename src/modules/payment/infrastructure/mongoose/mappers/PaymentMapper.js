const Payment = require('../../../domain/entities/Payment');

module.exports = {
    toDomain(document) {
        if (!document) return document;
        return new Payment(document.toObject ? document.toObject() : document);
    }
};
