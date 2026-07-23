const Code = require('../../../../../../../src/modules/user/domain/entities/Code');
import type { MappableDocument } from '../../../application/dtos/UserContracts';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        return new Code(document.toObject ? document.toObject() : document);
    }
};
