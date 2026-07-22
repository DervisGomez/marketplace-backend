const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'characterization-test-secret';
process.env.JWT_EXPIRATION_DAYS = '7';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
global.config = require('../../config');

let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
        binary: { version: process.env.MONGOMS_VERSION || '7.0.14' }
    });
    await mongoose.connect(mongo.getUri('characterization'), {
        useCreateIndex: true,
        useNewUrlParser: true
    });
});

beforeEach(async () => {
    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map(collection => collection.deleteMany({})));
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
});
