const BuyModel = require('../../../../../buy/buySchema');
const CategoryModel = require('../../../../../category/categorySchema');
const QuestionModel = require('../../../../../question/questionSchema');
const UserModel = require('../../../../../user/userSchema');
const PaymentModel = require('../../../../../buy/paymentSchema');
const AuthorizedModel = require('../../../../../product/authorizedSchema');

module.exports = {
    Buy: {
        aggregate: (...args) => BuyModel.aggregate(...args)
    },
    Category: {
        find: (...args) => CategoryModel.find(...args),
        findById: (...args) => CategoryModel.findById(...args)
    },
    Question: {
        find: (...args) => QuestionModel.find(...args)
    },
    User: {
        findById: (...args) => UserModel.findById(...args)
    },
    Payment: {
        aggregate: (...args) => PaymentModel.aggregate(...args)
    },
    Authorized: {
        find: (...args) => AuthorizedModel.find(...args)
    }
};
