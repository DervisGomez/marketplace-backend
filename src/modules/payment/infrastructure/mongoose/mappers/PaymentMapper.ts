const Payment = require('../../../../../../../src/modules/payment/domain/entities/Payment');
import type { MappableDocument } from '../../../../../shared/contracts/MapperContract';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        return new Payment(document.toObject ? document.toObject() : document);
    }
};
