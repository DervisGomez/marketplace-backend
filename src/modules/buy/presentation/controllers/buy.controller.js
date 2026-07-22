const useCases = require('../../application/services/BuyUseCaseRegistry');
const BuyRequestDto = require('../dto/BuyRequestDto');

function handler(name) {
    return function buyRequestHandler(req, res, next) {
        req.body = BuyRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

const names = [
    'createIncrement', 'new', 'find', 'findNumber', 'purchases',
    'purchasesDate', 'sale', 'saleDate', 'qualifyBuyer', 'qualifySeller',
    'recordBuyer', 'recordSeller', 'listBuyer', 'list', 'listProduct',
    'newComment', 'replyComment', 'listComment', 'meRecordBuyer',
    'meRecordUser', 'availability', 'balance', 'available', 'queryPayment',
    'withdrawals', 'listWithdrawals2', 'pendingPayments', 'pendingExecuted',
    'processPayments', 'search', 'gainQuantity', 'allGain', 'reportYear',
    'noqualifySeller', 'noqualifyBuyer', 'lock', 'lockList', 'report',
    'reportList', 'listWithdrawals', 'paymentYear'
];

module.exports = names.reduce((controller, name) => {
    controller[name] = handler(name);
    return controller;
}, {});
