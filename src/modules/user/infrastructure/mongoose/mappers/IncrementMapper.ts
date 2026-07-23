const Increment = require('../../../../../../../src/modules/user/domain/entities/Increment');
import type { MappableDocument } from '../../../application/dtos/UserContracts';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        return new Increment(document.toObject ? document.toObject() : document);
    }
};
