const Questions = require('../use-cases/questions/QuestionUseCases');
const Answers = require('../use-cases/answers/AnswerUseCases');
const Moderation = require('../use-cases/moderation/ModerationUseCases');
const Reporting = require('../use-cases/reporting/ReportingUseCases');

module.exports = Object.assign({}, Questions, Answers, Moderation, Reporting);
