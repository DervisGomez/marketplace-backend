const BuyModel = require('../../../../../buy/buySchema');

module.exports = {
    create: data => new BuyModel(data),
    aggregate: (...args) => BuyModel.aggregate(...args),
    countDocuments: (...args) => BuyModel.countDocuments(...args),
    find: (...args) => BuyModel.find(...args),
    findById: (...args) => BuyModel.findById(...args),
    findByIdAndUpdate: (...args) => BuyModel.findByIdAndUpdate(...args)
};
