const useCases = require('../../application/services/QuestionUseCaseRegistry');
const QuestionRequestDto = require('../dto/QuestionRequestDto');

function handler(name) {
    return function questionRequestHandler(req, res, next) {
        req.body = QuestionRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

const names = ['new', 'answer', 'product', 'user', 'client', 'productClient', 'lock', 'delete'];

module.exports = names.reduce((controller, name) => {
    controller[name] = handler(name);
    return controller;
}, {});
