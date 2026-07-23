const Model = require('../../../../../../../src/bank/bankSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');
module.exports = BaseMongoRepository.create(Model, ['create', 'deleteMany', 'find', 'findByIdAndUpdate']);
