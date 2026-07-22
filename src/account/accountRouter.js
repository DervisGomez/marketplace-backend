let express = require('express'),
    router = require('express-promise-router')(),
    ctrl =  require('./accountCtrl');
let Auth = require('../../middlewares/auth');

router.get('/',Auth,ctrl.list);

router.post('/',Auth,ctrl.add);

router.put('/',Auth,ctrl.edit);

router.delete('/',Auth,ctrl.remove);

module.exports = router;