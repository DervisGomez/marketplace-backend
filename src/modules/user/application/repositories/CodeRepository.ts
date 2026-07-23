const CodeModel = require('../../../../../../src/user/codeSchema');
const BaseMongoRepository = require('../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(CodeModel, [
    'create',
    'deleteMany',
    'deleteOne',
    'findById',
    'findByIdAndUpdate'
]);
