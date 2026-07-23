const Notifications = require('../use-cases/notifications/NotificationUseCases');
const Read = require('../use-cases/read/ReadUseCases');
const Management = require('../use-cases/management/ManagementUseCases');

module.exports = Object.assign({}, Notifications, Read, Management);
