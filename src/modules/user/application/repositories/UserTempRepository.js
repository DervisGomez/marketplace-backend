const UserTempModel = require('../../../../user/userTempSchema');
const BaseMongoRepository = require('../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(UserTempModel, [
    'create', 'deleteOne', 'findById', 'findByIdAndUpdate'
]);
