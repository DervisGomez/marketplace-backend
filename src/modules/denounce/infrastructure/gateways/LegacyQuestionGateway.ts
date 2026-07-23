const Question = require('../../../../../../src/question/questionSchema');
module.exports = { findByIdAndUpdate: Question.findByIdAndUpdate.bind(Question) };
