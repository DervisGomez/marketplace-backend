let express = require('express'),
    router = require('express-promise-router')(),
    ctrl =  require('./notificationCtrl');
let Auth = require('../../middlewares/auth');

router.get('/',Auth,ctrl.list);

router.put('/',Auth,ctrl.view);

router.put('/find',Auth,ctrl.find);

module.exports = router;