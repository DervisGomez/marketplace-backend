interface LegacyValidationService {
    required(error: unknown): Promise<readonly string[]>;
}

const Validate = require('../../../../../../services/validate') as LegacyValidationService;

const adapter = {
    required: (error: unknown): Promise<readonly string[]> => Validate.required(error)
};

export = adapter;
