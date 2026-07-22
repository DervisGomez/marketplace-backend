let router = require('express-promise-router')();
let ctrl = require('../controllers/payment.controller');
let Auth = require('../../../../../middlewares/auth');

router.get('/availability',Auth,ctrl.availability);
router.get('/balance',Auth,ctrl.balance);
router.get('/payment',Auth,ctrl.queryPayment);
router.get('/available',Auth,ctrl.available);
router.post('/withdrawals',Auth,ctrl.withdrawals);
router.get('/withdrawals',Auth,ctrl.listWithdrawals);
router.get('/payment/pendings',Auth,ctrl.pendingPayments);
router.get('/payment/executed',Auth,ctrl.pendingExecuted);
router.post('/payment/process',Auth,ctrl.processPayments);

module.exports = router;
