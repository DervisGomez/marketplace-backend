const UserTemp = require('../../../../../../../src/modules/user/domain/entities/UserTemp');
import type { MappableDocument } from '../../../application/dtos/UserContracts';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        return new UserTemp(document.toObject ? document.toObject() : document);
    }
};
