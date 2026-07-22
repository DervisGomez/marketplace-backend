let express = require('express'),
    router = require('express-promise-router')(),
    ctrl =  require('./categoryCtrl');
let Auth = require('../../middlewares/auth');

router.get('/load',ctrl.load);

router.get('/list',ctrl.list);

router.get('/list/record',Auth,ctrl.listProduct);

router.get('/list-home',ctrl.listHome);

router.post('/',ctrl.add);

router.put('/',ctrl.edit);

router.delete('/',ctrl.remove);

router.post('/sub',ctrl.addSub);

router.put('/sub',ctrl.editSub);

router.delete('/sub',ctrl.removeSub);

module.exports = router;