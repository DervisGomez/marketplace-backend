const ProductModel = require('../../../../product/productSchema');
const UserModel = require('../../../../user/userSchema');
const QuestionModel = require('../../../../question/questionSchema');
const AccountModel = require('../../../../account/accountSchema');
const BankModel = require('../../../../bank/bankSchema');
const AuthorizedModel = require('../../../../product/authorizedSchema');

module.exports = {
    Product: {
        findByIdAndUpdate: (...args) => ProductModel.findByIdAndUpdate(...args)
    },
    User: {
        aggregate: (...args) => UserModel.aggregate(...args),
        countDocuments: (...args) => UserModel.countDocuments(...args),
        findByIdAndUpdate: (...args) => UserModel.findByIdAndUpdate(...args)
    },
    Question: {
        countDocuments: (...args) => QuestionModel.countDocuments(...args),
        find: (...args) => QuestionModel.find(...args)
    },
    Account: {
        find: (...args) => AccountModel.find(...args)
    },
    Bank: {
        find: (...args) => BankModel.find(...args)
    },
    Authorized: {
        create: data => new AuthorizedModel(data),
        findByIdAndUpdate: (...args) => AuthorizedModel.findByIdAndUpdate(...args)
    }
};
