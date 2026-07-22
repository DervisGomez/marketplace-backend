const MessageModel = require('../../../../../buy/messageSchema');

module.exports = {
    create: data => MessageModel(data),
    find: (...args) => MessageModel.find(...args),
    findByIdAndUpdate: (...args) => MessageModel.findByIdAndUpdate(...args)
};
