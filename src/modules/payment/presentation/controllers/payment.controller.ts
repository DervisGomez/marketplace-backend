const useCases = require('../../application/services/PaymentUseCaseRegistry');
const PaymentRequestDto = require('../dto/PaymentRequestDto');
import type { NextFunction, Response } from 'express';
import type { PaymentHandler, PaymentHttpRequest } from '../dto/PaymentContracts';

function handler(name: string): PaymentHandler {
    return function paymentRequestHandler(req: PaymentHttpRequest, res: Response, next: NextFunction) {
        req.body = PaymentRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

module.exports = {
    availability: handler('availability'),
    balance: handler('balance'),
    available: handler('available'),
    queryPayment: handler('queryPayment'),
    withdrawals: handler('withdrawals'),
    listWithdrawals2: handler('listWithdrawals2'),
    listWithdrawals: handler('listWithdrawals'),
    pendingPayments: handler('pendingPayments'),
    pendingExecuted: handler('pendingExecuted'),
    processPayments: handler('processPayments')
};
