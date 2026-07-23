interface LegacyModel {
    findByIdAndUpdate(...args: readonly unknown[]): unknown;
    new (data: unknown): unknown;
}

const UserModel = require('../../../../../../src/user/userSchema') as LegacyModel;
const NotificationModel = require('../../../../../../src/notification/notificationSchema') as LegacyModel;

const gateway = {
    User: {
        findByIdAndUpdate: (...args: readonly unknown[]): unknown => UserModel.findByIdAndUpdate(...args)
    },
    Notification: {
        create: (data: unknown): unknown => new NotificationModel(data)
    }
};

export = gateway;
