const BuyModel = require('../../../../../../../src/buy/buySchema');
const CategoryModel = require('../../../../../../../src/category/categorySchema');
const QuestionModel = require('../../../../../../../src/question/questionSchema');
const UserModel = require('../../../../../../../src/user/userSchema');
const PaymentModel = require('../../../../../../../src/buy/paymentSchema');
const AuthorizedModel = require('../../../../../../../src/product/authorizedSchema');

module.exports = {
    Buy: {
        aggregate: (...args: readonly unknown[]) => BuyModel.aggregate(...args)
    },
    Category: {
        find: (...args: readonly unknown[]) => CategoryModel.find(...args),
        findById: (...args: readonly unknown[]) => CategoryModel.findById(...args)
    },
    Question: {
        find: (...args: readonly unknown[]) => QuestionModel.find(...args)
    },
    User: {
        findById: (...args: readonly unknown[]) => UserModel.findById(...args)
    },
    Payment: {
        aggregate: (...args: readonly unknown[]) => PaymentModel.aggregate(...args)
    },
    Authorized: {
        find: (...args: readonly unknown[]) => AuthorizedModel.find(...args)
    }
};
