const useCases = require('../../application/services/PaymentUseCaseRegistry');
const PaymentRequestDto = require('../dto/PaymentRequestDto');

function handler(name) {
    return function paymentRequestHandler(req, res, next) {
        req.body = PaymentRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

const names = [
    'availability', 'balance', 'available', 'queryPayment', 'withdrawals',
    'listWithdrawals2', 'listWithdrawals', 'pendingPayments',
    'pendingExecuted', 'processPayments'
];

module.exports = names.reduce((controller, name) => {
    controller[name] = handler(name);
    return controller;
}, {});
