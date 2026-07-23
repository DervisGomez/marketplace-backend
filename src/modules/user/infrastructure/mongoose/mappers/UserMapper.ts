const User = require('../../../../../../../src/modules/user/domain/entities/User');
import type { MappableDocument } from '../../../application/dtos/UserContracts';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        const data = document.toObject ? document.toObject() : document;
        return new User(data);
    },
    toDto(value: MappableDocument | null | undefined) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
