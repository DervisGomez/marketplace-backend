const Model = require('../../../../../../../src/chat/chatSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');
module.exports = BaseMongoRepository.create(Model, ['create', 'find']);
