export interface ApplicationConfig {
    readonly controllers: Readonly<{
        default: string;
        current: string;
    }>;
}

export interface MarketplaceConfig {
    readonly application: ApplicationConfig;
    readonly cloudinary: Readonly<{
        key?: string;
        name?: string;
        secret?: string;
    }>;
    readonly db: Readonly<{ port: string }>;
    readonly mailjet: Readonly<{
        api_key?: string;
        from_email?: string;
        from_name: string;
        secret?: string;
    }>;
    readonly path: Readonly<{ uploads: string }>;
    readonly redis: Readonly<{ port: string }>;
    readonly server: Readonly<{ port: string | number }>;
    readonly token: Readonly<{
        bcrypt_salt?: string;
        bcrypt_salt_rounds: number;
        days: number;
        secret?: string;
    }>;
    readonly twilio: Readonly<{
        account_sind?: string;
        auth_token?: string;
        phone_number?: string;
    }>;
    readonly url: Readonly<{ web: string }>;
}

const config: MarketplaceConfig = {
    url: {
        web: process.env.WEB_URL || 'http://localhost:4200/'
    },
    server: {
        port: process.env.PORT || 3000
    },
    db: {
        port: process.env.MONGODB_URI || 'mongodb://localhost/mlolx'
    },
    redis: {
        port: process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379'
    },
    token: {
        secret: process.env.JWT_SECRET,
        bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
        bcrypt_salt: process.env.BCRYPT_SALT,
        days: Number(process.env.JWT_EXPIRATION_DAYS || 7)
    },
    path: {
        uploads: process.env.UPLOADS_PATH || './uploads'
    },
    twilio: {
        account_sind: process.env.TWILIO_ACCOUNT_SID,
        auth_token: process.env.TWILIO_AUTH_TOKEN,
        phone_number: process.env.TWILIO_PHONE_NUMBER
    },
    application: {
        controllers: {
            default: 'index',
            current: ''
        }
    },
    cloudinary: {
        name: process.env.CLOUDINARY_CLOUD_NAME,
        key: process.env.CLOUDINARY_API_KEY,
        secret: process.env.CLOUDINARY_API_SECRET
    },
    mailjet: {
        api_key: process.env.MAILJET_API_KEY,
        secret: process.env.MAILJET_SECRET,
        from_email: process.env.MAILJET_FROM_EMAIL,
        from_name: process.env.MAILJET_FROM_NAME || 'MLOLX'
    }
};

export = config;
