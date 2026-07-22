const UserModel = require('../../../../user/userSchema');

module.exports = {
    create: data => new UserModel(data),
    find: (...args) => UserModel.find(...args),
    findOne: (...args) => UserModel.findOne(...args),
    findById: (...args) => UserModel.findById(...args),
    findByIdAndUpdate: (...args) => UserModel.findByIdAndUpdate(...args),
    findOneAndUpdate: (...args) => UserModel.findOneAndUpdate(...args),
    update: (...args) => UserModel.update(...args)
};
