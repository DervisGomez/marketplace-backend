const MessageModel = require('../../../../../../../src/buy/messageSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(MessageModel, ['create', 'find', 'findByIdAndUpdate'], {
    callableCreate: true
});
