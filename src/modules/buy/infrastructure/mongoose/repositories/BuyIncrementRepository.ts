const IncrementModel = require('../../../../../../../src/buy/incrementShema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(IncrementModel, ['create', 'findOneAndUpdate']);
