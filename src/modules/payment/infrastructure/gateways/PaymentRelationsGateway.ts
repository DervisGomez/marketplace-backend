const BuyModel = require('../../../../../../src/buy/buySchema');
const QuestionModel = require('../../../../../../src/question/questionSchema');
const AccountModel = require('../../../../../../src/account/accountSchema');
const BankModel = require('../../../../../../src/bank/bankSchema');

module.exports = {
    Buy: {
        countDocuments: (...args: readonly unknown[]) => BuyModel.countDocuments(...args),
        find: (...args: readonly unknown[]) => BuyModel.find(...args)
    },
    Question: {
        countDocuments: (...args: readonly unknown[]) => QuestionModel.countDocuments(...args)
    },
    Account: {
        find: (...args: readonly unknown[]) => AccountModel.find(...args)
    },
    Bank: {
        find: (...args: readonly unknown[]) => BankModel.find(...args)
    }
};
