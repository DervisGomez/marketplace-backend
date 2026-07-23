const UserModel = require('../../../../../../src/user/userSchema');
const BaseMongoRepository = require('../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(UserModel, [
    'create',
    'find',
    'findOne',
    'findById',
    'findByIdAndUpdate',
    'findOneAndUpdate',
    'updateOne'
]);
