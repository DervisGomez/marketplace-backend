const Question = require('../../../../../../../src/modules/question/domain/entities/Question');
import type { MappableDocument } from '../../../../../shared/contracts/MapperContract';

module.exports = {
    toDomain(document: MappableDocument | null | undefined) {
        if (!document) return document;
        return new Question(document.toObject ? document.toObject() : document);
    },
    toDto(value: MappableDocument | null | undefined) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
