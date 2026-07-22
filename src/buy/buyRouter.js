let express = require('express'),
    router = require('express-promise-router')(),
    ctrl =  require('./buyCtrl');
let Auth = require('../../middlewares/auth');

router.post('/',Auth,ctrl.new);

router.get('/',Auth,ctrl.find);

router.get('/number',Auth,ctrl.findNumber);

router.get('/purchases',Auth,ctrl.purchases);

router.get('/purchases/summary',Auth,ctrl.purchasesDate);

router.get('/sale',Auth,ctrl.sale);

router.get('/sale/summary',Auth,ctrl.saleDate);

router.put('/qualify/buyer',Auth,ctrl.qualifyBuyer);

router.put('/qualify/seller',Auth,ctrl.qualifySeller);

router.get('/record/buyer',Auth,ctrl.recordBuyer);

router.get('/record/seller',Auth,ctrl.recordSeller);

router.get('/find',ctrl.list);

router.get('/find/buyer',ctrl.listBuyer);

router.get('/find/product',ctrl.listProduct);

router.post('/message',Auth,ctrl.newComment);

router.put('/message',Auth,ctrl.replyComment);

router.get('/message',Auth,ctrl.listComment);

router.get('/reputation/buyer',Auth,ctrl.meRecordBuyer);

router.get('/reputation/sale',Auth,ctrl.meRecordUser);

router.get('/availability',Auth,ctrl.availability);

router.get('/balance',Auth,ctrl.balance);

router.get('/payment',Auth,ctrl.queryPayment);

router.get('/available',Auth,ctrl.available);

router.post('/withdrawals',Auth,ctrl.withdrawals);

router.get('/withdrawals',Auth,ctrl.listWithdrawals);

router.get('/increment',ctrl.createIncrement);

router.get('/search',Auth,ctrl.search);

router.get('/gain',Auth,ctrl.allGain);

router.get('/gain/year',ctrl.reportYear);

router.get('/gain/quantity',Auth,ctrl.gainQuantity);

router.get('/noqualify/seller',Auth,ctrl.noqualifySeller);

router.get('/noqualify/buyer',Auth,ctrl.noqualifyBuyer);

router.get('/lock',Auth,ctrl.lock);

router.get('/lock/list',Auth,ctrl.lockList);

router.put('/report',Auth,ctrl.report);

router.get('/report',Auth,ctrl.reportList);

router.get('/payment/pendings',Auth,ctrl.pendingPayments);

router.get('/payment/executed',Auth,ctrl.pendingExecuted);

router.post('/payment/process',Auth,ctrl.processPayments);

module.exports = router;