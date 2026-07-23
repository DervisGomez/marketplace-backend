const ProductModel = require('../../../../../../src/product/productSchema');
const UserModel = require('../../../../../../src/user/userSchema');
const QuestionModel = require('../../../../../../src/question/questionSchema');
const AccountModel = require('../../../../../../src/account/accountSchema');
const BankModel = require('../../../../../../src/bank/bankSchema');
const AuthorizedModel = require('../../../../../../src/product/authorizedSchema');

module.exports = {
    Product: {
        findByIdAndUpdate: (...args: readonly unknown[]) => ProductModel.findByIdAndUpdate(...args)
    },
    User: {
        aggregate: (...args: readonly unknown[]) => UserModel.aggregate(...args),
        countDocuments: (...args: readonly unknown[]) => UserModel.countDocuments(...args),
        findByIdAndUpdate: (...args: readonly unknown[]) => UserModel.findByIdAndUpdate(...args)
    },
    Question: {
        countDocuments: (...args: readonly unknown[]) => QuestionModel.countDocuments(...args),
        find: (...args: readonly unknown[]) => QuestionModel.find(...args)
    },
    Account: {
        find: (...args: readonly unknown[]) => AccountModel.find(...args)
    },
    Bank: {
        find: (...args: readonly unknown[]) => BankModel.find(...args)
    },
    Authorized: {
        create: (data: unknown) => new AuthorizedModel(data),
        findByIdAndUpdate: (...args: readonly unknown[]) => AuthorizedModel.findByIdAndUpdate(...args)
    }
};
