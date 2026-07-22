const ProductModel = require('../../../../product/productSchema');
const PaymentModel = require('../../../../buy/paymentSchema');
const BuyModel = require('../../../../buy/buySchema');

const proxy = model => ({
    aggregate: (...args) => model.aggregate(...args),
    countDocuments: (...args) => model.countDocuments(...args),
    update: (...args) => model.update(...args)
});

module.exports = {
    Product: proxy(ProductModel),
    Payment: proxy(PaymentModel),
    Buy: proxy(BuyModel)
};
