const Product = require('../../../../../../src/product/productSchema');

module.exports = {
    deleteMany: Product.deleteMany.bind(Product),
    find: Product.find.bind(Product)
};
