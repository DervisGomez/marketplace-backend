let express = require('express'),
    router = require('express-promise-router')(),
    ctrl =  require('./denounce.Ctrl');
let Auth = require('../../middlewares/auth');

router.post('/',Auth,ctrl.add);

module.exports = router;