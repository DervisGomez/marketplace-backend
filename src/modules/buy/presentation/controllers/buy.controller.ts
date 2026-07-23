const useCases = require('../../application/services/BuyUseCaseRegistry');
const BuyRequestDto = require('../dto/BuyRequestDto');
import type { NextFunction, Response } from 'express';
import type { BuyHandler, BuyHttpRequest } from '../dto/BuyContracts';

function handler(name: string): BuyHandler {
    return function buyRequestHandler(req: BuyHttpRequest, res: Response, next: NextFunction) {
        req.body = BuyRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

module.exports = {
    createIncrement: handler('createIncrement'),
    new: handler('new'),
    find: handler('find'),
    findNumber: handler('findNumber'),
    purchases: handler('purchases'),
    purchasesDate: handler('purchasesDate'),
    sale: handler('sale'),
    saleDate: handler('saleDate'),
    qualifyBuyer: handler('qualifyBuyer'),
    qualifySeller: handler('qualifySeller'),
    recordBuyer: handler('recordBuyer'),
    recordSeller: handler('recordSeller'),
    listBuyer: handler('listBuyer'),
    list: handler('list'),
    listProduct: handler('listProduct'),
    newComment: handler('newComment'),
    replyComment: handler('replyComment'),
    listComment: handler('listComment'),
    meRecordBuyer: handler('meRecordBuyer'),
    meRecordUser: handler('meRecordUser'),
    availability: handler('availability'),
    balance: handler('balance'),
    available: handler('available'),
    queryPayment: handler('queryPayment'),
    withdrawals: handler('withdrawals'),
    listWithdrawals2: handler('listWithdrawals2'),
    pendingPayments: handler('pendingPayments'),
    pendingExecuted: handler('pendingExecuted'),
    processPayments: handler('processPayments'),
    search: handler('search'),
    gainQuantity: handler('gainQuantity'),
    allGain: handler('allGain'),
    reportYear: handler('reportYear'),
    noqualifySeller: handler('noqualifySeller'),
    noqualifyBuyer: handler('noqualifyBuyer'),
    lock: handler('lock'),
    lockList: handler('lockList'),
    report: handler('report'),
    reportList: handler('reportList'),
    listWithdrawals: handler('listWithdrawals'),
    paymentYear: handler('paymentYear')
};
