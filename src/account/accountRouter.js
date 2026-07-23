let router = require('../infrastructure/http/createRouter')(),
    ctrl = require('./accountCtrl');
let Auth = require('../../middlewares/auth');

router.get('/', Auth, ctrl.list);

router.post('/', Auth, ctrl.add);

router.put('/', Auth, ctrl.edit);

router.delete('/', Auth, ctrl.remove);

module.exports = router;
