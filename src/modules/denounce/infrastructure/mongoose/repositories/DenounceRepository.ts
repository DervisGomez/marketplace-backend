const Model = require('../../../../../../../src/denounce/denounceSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');
module.exports = BaseMongoRepository.create(Model, ['create']);
