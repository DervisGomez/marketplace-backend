const NotificationModel = require('../../../../../notification/notificationSchema');
const BaseMongoRepository = require('../../../../../shared/infrastructure/mongoose/BaseMongoRepository');

module.exports = BaseMongoRepository.create(NotificationModel, ['aggregate', 'find', 'updateMany']);
