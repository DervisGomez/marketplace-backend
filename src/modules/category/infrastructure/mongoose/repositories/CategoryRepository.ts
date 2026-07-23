const CategoryModel = require('../../../../../../../src/category/categorySchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(CategoryModel, ['create', 'deleteMany', 'find', 'findByIdAndUpdate']);
