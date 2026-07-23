const NotificationModel = require('../../../../../../../src/notification/notificationSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(NotificationModel, ['aggregate', 'find', 'updateMany']);
