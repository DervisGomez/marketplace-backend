const modules = [
    require('../use-cases/notifications/NotificationUseCases'),
    require('../use-cases/read/ReadUseCases'),
    require('../use-cases/management/ManagementUseCases')
];

module.exports = Object.assign({}, ...modules);
