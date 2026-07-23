const Model = require('../../../../../../../src/account/accountSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');
module.exports = BaseMongoRepository.create(Model, ['create', 'deleteMany', 'find', 'findByIdAndUpdate']);
