import type { MappableDocument } from '../../../../../shared/contracts/MapperContract';

module.exports = {
    toDto(value: MappableDocument | null | undefined) {
        if (!value) return value;
        return Object.assign({}, value.toObject ? value.toObject() : value);
    }
};
