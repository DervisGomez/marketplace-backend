const ProductModel = require('../../../../../product/productSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(ProductModel, [
    'create', 'aggregate', 'countDocuments', 'find', 'findById', 'findByIdAndUpdate', 'update'
]);
