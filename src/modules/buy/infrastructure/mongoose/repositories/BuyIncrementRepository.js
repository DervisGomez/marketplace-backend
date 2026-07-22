const IncrementModel = require('../../../../../buy/incrementShema');

module.exports = {
    create: data => new IncrementModel(data),
    findOneAndUpdate: (...args) => IncrementModel.findOneAndUpdate(...args)
};
