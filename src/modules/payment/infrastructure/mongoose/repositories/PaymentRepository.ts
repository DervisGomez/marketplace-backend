const PaymentModel = require('../../../../../../../src/buy/paymentSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(PaymentModel, [
    'create',
    'aggregate',
    'countDocuments',
    'find',
    'findByIdAndUpdate',
    'update'
]);
