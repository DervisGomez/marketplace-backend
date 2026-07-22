const CodeModel = require('../../../../user/codeSchema');

module.exports = {
    create: data => new CodeModel(data),
    deleteOne: (...args) => CodeModel.deleteOne(...args),
    findById: (...args) => CodeModel.findById(...args),
    findByIdAndUpdate: (...args) => CodeModel.findByIdAndUpdate(...args),
    remove: (...args) => CodeModel.remove(...args)
};
