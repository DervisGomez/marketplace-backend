const ProductModel = require('../../../../../product/productSchema');

module.exports = {
    create: data => new ProductModel(data),
    aggregate: (...args) => ProductModel.aggregate(...args),
    countDocuments: (...args) => ProductModel.countDocuments(...args),
    find: (...args) => ProductModel.find(...args),
    findById: (...args) => ProductModel.findById(...args),
    findByIdAndUpdate: (...args) => ProductModel.findByIdAndUpdate(...args),
    update: (...args) => ProductModel.update(...args)
};
