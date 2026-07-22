const UserTempModel = require('../../../../user/userTempSchema');

module.exports = {
    create: data => new UserTempModel(data),
    deleteOne: (...args) => UserTempModel.deleteOne(...args),
    findById: (...args) => UserTempModel.findById(...args),
    findByIdAndUpdate: (...args) => UserTempModel.findByIdAndUpdate(...args)
};
