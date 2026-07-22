const NotificationModel = require('../../../../../notification/notificationSchema');

module.exports = {
    aggregate: (...args) => NotificationModel.aggregate(...args),
    find: (...args) => NotificationModel.find(...args),
    update: (...args) => NotificationModel.update(...args)
};
