const useCases = require('../../application/services/NotificationUseCaseRegistry');
const NotificationRequestDto = require('../dto/NotificationRequestDto');

function handler(name) {
    return function notificationRequestHandler(req, res, next) {
        req.body = NotificationRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

const names = ['list', 'view', 'find'];

module.exports = names.reduce((controller, name) => {
    controller[name] = handler(name);
    return controller;
}, {});
