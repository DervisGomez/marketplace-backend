const PaymentModel = require('../../../../../buy/paymentSchema');

module.exports = {
    create: data => new PaymentModel(data),
    aggregate: (...args) => PaymentModel.aggregate(...args),
    countDocuments: (...args) => PaymentModel.countDocuments(...args),
    find: (...args) => PaymentModel.find(...args),
    findByIdAndUpdate: (...args) => PaymentModel.findByIdAndUpdate(...args),
    update: (...args) => PaymentModel.update(...args)
};
