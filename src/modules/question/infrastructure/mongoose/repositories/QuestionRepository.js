const QuestionModel = require('../../../../../question/questionSchema');

module.exports = {
    create: data => new QuestionModel(data),
    countDocuments: (...args) => QuestionModel.countDocuments(...args),
    find: (...args) => QuestionModel.find(...args),
    findByIdAndUpdate: (...args) => QuestionModel.findByIdAndUpdate(...args)
};
