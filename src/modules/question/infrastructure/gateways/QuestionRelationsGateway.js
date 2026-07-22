const UserModel = require('../../../../user/userSchema');
const NotificationModel = require('../../../../notification/notificationSchema');

module.exports = {
    User: {
        findByIdAndUpdate: (...args) => UserModel.findByIdAndUpdate(...args)
    },
    Notification: {
        create: data => new NotificationModel(data)
    }
};
