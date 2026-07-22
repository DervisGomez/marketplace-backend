const modules = [
    require('../use-cases/questions/QuestionUseCases'),
    require('../use-cases/answers/AnswerUseCases'),
    require('../use-cases/moderation/ModerationUseCases'),
    require('../use-cases/reporting/ReportingUseCases')
];

module.exports = Object.assign({}, ...modules);
