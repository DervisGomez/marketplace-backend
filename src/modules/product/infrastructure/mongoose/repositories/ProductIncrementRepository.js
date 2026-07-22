const IncrementModel = require('../../../../../product/incrementShema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(IncrementModel, ['create', 'findOneAndUpdate']);
