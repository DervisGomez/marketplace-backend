const BuyModel = require('../../../../../buy/buySchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(BuyModel, [
    'create', 'aggregate', 'countDocuments', 'find', 'findById', 'findByIdAndUpdate'
]);
