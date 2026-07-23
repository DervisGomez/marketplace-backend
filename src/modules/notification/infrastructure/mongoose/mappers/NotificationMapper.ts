const Notification = require('../../../../../../../src/modules/notification/domain/entities/Notification');
import type { MappableDocument } from '../../../../../shared/contracts/MapperContract';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        return new Notification(document.toObject ? document.toObject() : document);
    },
    toDto(value: MappableDocument | null | undefined) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
