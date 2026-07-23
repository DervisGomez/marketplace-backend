const Message = require('../../../../../../../src/modules/buy/domain/entities/Message');
import type { MappableDocument } from '../../../../../shared/contracts/MapperContract';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        return new Message(document.toObject ? document.toObject() : document);
    }
};
