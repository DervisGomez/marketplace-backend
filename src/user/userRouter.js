let express = require('express'),
    router = require('express-promise-router')(),
    ctrl =  require('./userCtrl');
let Auth = require('../../middlewares/auth');

router.get('/increment',ctrl.createIncrement);

router.get('/link-invitation',ctrl.linkInvitation);

router.post('/code-register',ctrl.codeRegister);

router.post('/resend-code',ctrl.resendCode);

router.post('/register',ctrl.register);

router.post('/login',ctrl.login);

router.post('/recover-password/phone',ctrl.recoverPasswordPhone);

router.post('/recover-password/email',ctrl.recoverPasswordEmail);

router.post('/code-resend/phone',ctrl.codeResendPhone);

router.post('/recovery-code/phone',ctrl.recoveryCodePhone);

router.post('/new-password',ctrl.newPassword);

router.post('/new-password/email',ctrl.newPasswordEmail);

router.put('/username',Auth,ctrl.modifyUser);

router.put('/password',Auth,ctrl.modifyPassword);

router.put('/phone',Auth,ctrl.modifyPhone);

router.put('/email',Auth,ctrl.modifyEmail);

router.put('/name',Auth,ctrl.modifyName);

router.put('/identification',Auth,ctrl.modifyIdentification);

router.put('/photo',Auth,ctrl.modifyPhoto);

router.put('/new-phone',Auth,ctrl.newPhone);

router.put('/new-email',Auth,ctrl.newEmail);

router.put('/location',Auth,ctrl.modifyLocation);

router.put('/document',Auth,ctrl.modifyDocument);

router.get('/me',Auth,ctrl.me);

router.get('/record2',ctrl.recordUser);

router.get('/record',Auth,ctrl.record);

router.get('/referred',Auth,ctrl.referred);

router.get('/operations',ctrl.operations);

router.get('/operations/seller',ctrl.operationsSeller);

router.get('/operations/buyer',ctrl.operationsBuyer);

router.get('/new',ctrl.userNew);

router.get('/active',ctrl.userActive);

router.get('/record/info',ctrl.recordInfo);

router.get('/birthdate',Auth,ctrl.birthdate);

module.exports = router;