const ProductModel = require('../../../../../../src/product/productSchema');
const PaymentModel = require('../../../../../../src/buy/paymentSchema');
const BuyModel = require('../../../../../../src/buy/buySchema');
const BaseMongoRepository = require('../../../../shared/infrastructure/mongoose/BaseMongoRepository');

type RepositoryModel = Parameters<typeof BaseMongoRepository.create>[0];

const proxy = (model: RepositoryModel) =>
    BaseMongoRepository.create(model, ['aggregate', 'countDocuments', 'updateMany', 'updateOne']);

module.exports = {
    Product: proxy(ProductModel),
    Payment: proxy(PaymentModel),
    Buy: proxy(BuyModel)
};
