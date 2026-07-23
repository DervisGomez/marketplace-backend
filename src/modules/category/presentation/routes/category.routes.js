let router = require('../../../../infrastructure/http/createRouter')(),
    ctrl = require('../controllers/category.controller');
let Auth = require('../../../../../middlewares/auth');

router.get('/load', ctrl.load);

router.get('/list', ctrl.list);

router.get('/list/record', Auth, ctrl.listProduct);

router.get('/list-home', ctrl.listHome);

router.post('/', ctrl.add);

router.put('/', ctrl.edit);

router.delete('/', ctrl.remove);

router.post('/sub', ctrl.addSub);

router.put('/sub', ctrl.editSub);

router.delete('/sub', ctrl.removeSub);

module.exports = router;
