const Model = require('../../../../../../../src/invest/investSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');
module.exports = BaseMongoRepository.create(Model, ['create']);
