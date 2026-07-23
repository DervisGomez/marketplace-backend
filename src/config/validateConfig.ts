import type { MarketplaceConfig } from './config';

interface RequiredVariable {
    readonly name: string;
    readonly value: string | undefined;
}

class ConfigurationValidationError extends Error {
    readonly environment: string;
    readonly missingVariables: readonly string[];

    constructor(environment: string, missingVariables: readonly string[]) {
        const noun = missingVariables.length === 1 ? 'variable' : 'variables';
        super(
            `Invalid configuration for ${environment}: missing required environment ${noun} ${missingVariables.join(', ')}`
        );
        this.name = 'ConfigurationValidationError';
        this.environment = environment;
        this.missingVariables = missingVariables;
    }
}

function requiredVariables(config: MarketplaceConfig, environment: string): readonly RequiredVariable[] {
    const variables: RequiredVariable[] = [{ name: 'JWT_SECRET', value: config.token.secret }];

    if (environment === 'production') {
        variables.push(
            { name: 'CLOUDINARY_CLOUD_NAME', value: config.cloudinary.name },
            { name: 'CLOUDINARY_API_KEY', value: config.cloudinary.key },
            { name: 'CLOUDINARY_API_SECRET', value: config.cloudinary.secret },
            { name: 'MAILJET_API_KEY', value: config.mailjet.api_key },
            { name: 'MAILJET_SECRET', value: config.mailjet.secret },
            { name: 'MAILJET_FROM_EMAIL', value: config.mailjet.from_email },
            { name: 'TWILIO_ACCOUNT_SID', value: config.twilio.account_sind },
            { name: 'TWILIO_AUTH_TOKEN', value: config.twilio.auth_token },
            { name: 'TWILIO_PHONE_NUMBER', value: config.twilio.phone_number }
        );
    }

    return variables;
}

function validateConfig(config: MarketplaceConfig, environment = process.env.NODE_ENV || 'development'): void {
    const missingVariables = requiredVariables(config, environment)
        .filter(variable => !variable.value || variable.value.trim().length === 0)
        .map(variable => variable.name);

    if (missingVariables.length > 0) {
        throw new ConfigurationValidationError(environment, missingVariables);
    }
}

export = validateConfig;
