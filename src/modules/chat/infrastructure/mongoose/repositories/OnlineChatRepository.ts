const Model = require('../../../../../../../src/chat/onlineChatSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');
module.exports = BaseMongoRepository.create(Model, [
    'countDocuments',
    'create',
    'find',
    'findById',
    'findByIdAndUpdate'
]);
