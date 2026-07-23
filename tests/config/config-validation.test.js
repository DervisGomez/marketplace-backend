const { spawnSync } = require('node:child_process');
const path = require('node:path');

const validateConfig = require('../../dist/src/config/validateConfig');

function validConfig() {
    return {
        cloudinary: { key: 'cloudinary-key', name: 'cloudinary-name', secret: 'cloudinary-secret' },
        mailjet: {
            api_key: 'mailjet-key',
            from_email: 'marketplace@example.test',
            from_name: 'Marketplace',
            secret: 'mailjet-secret'
        },
        token: { bcrypt_salt_rounds: 10, days: 7, secret: 'jwt-secret' },
        twilio: {
            account_sind: 'twilio-account',
            auth_token: 'twilio-token',
            phone_number: '+570000000000'
        }
    };
}

describe('startup configuration validation', () => {
    it('accepts valid production configuration', () => {
        expect(() => validateConfig(validConfig(), 'production')).not.toThrow();
    });

    it('reports a required variable that is absent', () => {
        const config = validConfig();
        config.token.secret = undefined;

        expect(() => validateConfig(config, 'development')).toThrowError(
            'Invalid configuration for development: missing required environment variable JWT_SECRET'
        );
    });

    it('requires provider credentials only in production', () => {
        const developmentConfig = validConfig();
        developmentConfig.cloudinary = {};
        developmentConfig.mailjet = { from_name: 'Marketplace' };
        developmentConfig.twilio = {};

        expect(() => validateConfig(developmentConfig, 'development')).not.toThrow();
        expect(() => validateConfig(developmentConfig, 'production')).toThrowError(
            /CLOUDINARY_CLOUD_NAME.*CLOUDINARY_API_KEY.*CLOUDINARY_API_SECRET.*MAILJET_API_KEY.*MAILJET_SECRET.*MAILJET_FROM_EMAIL.*TWILIO_ACCOUNT_SID.*TWILIO_AUTH_TOKEN.*TWILIO_PHONE_NUMBER/
        );
    });

    it('aborts startup with a clear error before accepting traffic', () => {
        const environment = {
            ...process.env,
            NODE_ENV: 'production',
            JWT_SECRET: '',
            CLOUDINARY_CLOUD_NAME: 'test',
            CLOUDINARY_API_KEY: 'test',
            CLOUDINARY_API_SECRET: 'test',
            MAILJET_API_KEY: 'test',
            MAILJET_SECRET: 'test',
            MAILJET_FROM_EMAIL: 'marketplace@example.test',
            TWILIO_ACCOUNT_SID: 'test',
            TWILIO_AUTH_TOKEN: 'test',
            TWILIO_PHONE_NUMBER: '+570000000000'
        };
        const result = spawnSync(process.execPath, ['server.js'], {
            cwd: path.resolve(__dirname, '../..'),
            encoding: 'utf8',
            env: environment,
            timeout: 10000
        });
        const output = `${result.stdout}\n${result.stderr}`;

        expect(result.status).not.toBe(0);
        expect(output).toContain('Invalid application configuration');
        expect(output).toContain('JWT_SECRET');
        expect(output).not.toContain('HTTP server listening');
    });
});
