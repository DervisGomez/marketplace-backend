const BuyModel = require('../../../../buy/buySchema');
const QuestionModel = require('../../../../question/questionSchema');
const AccountModel = require('../../../../account/accountSchema');
const BankModel = require('../../../../bank/bankSchema');

module.exports = {
    Buy: {
        countDocuments: (...args) => BuyModel.countDocuments(...args),
        find: (...args) => BuyModel.find(...args)
    },
    Question: {
        countDocuments: (...args) => QuestionModel.countDocuments(...args)
    },
    Account: {
        find: (...args) => AccountModel.find(...args)
    },
    Bank: {
        find: (...args) => BankModel.find(...args)
    }
};
