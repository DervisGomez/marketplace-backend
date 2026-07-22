const ProductModel = require('../../../../product/productSchema');
const PaymentModel = require('../../../../buy/paymentSchema');
const BuyModel = require('../../../../buy/buySchema');
const BaseMongoRepository = require('../../../../shared/infrastructure/mongoose/BaseMongoRepository');

const proxy = model => BaseMongoRepository.create(model, ['aggregate', 'countDocuments', 'update']);

module.exports = {
    Product: proxy(ProductModel),
    Payment: proxy(PaymentModel),
    Buy: proxy(BuyModel)
};
