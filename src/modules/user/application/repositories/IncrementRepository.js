const IncrementModel = require('../../../../user/incrementShema');

module.exports = {
    create: data => new IncrementModel(data),
    findOneAndUpdate: (...args) => IncrementModel.findOneAndUpdate(...args)
};
