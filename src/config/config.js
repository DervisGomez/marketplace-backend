var config = {
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

module.exports = config;
