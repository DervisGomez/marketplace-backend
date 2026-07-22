const QuestionModel = require('../../../../../question/questionSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(QuestionModel, [
    'create', 'countDocuments', 'find', 'findByIdAndUpdate'
]);
