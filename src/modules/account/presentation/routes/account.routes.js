let router = require('../../../../infrastructure/http/createRouter')(),
    ctrl = require('../../../../../dist/src/modules/account/presentation/controllers/account.controller');
let Auth = require('../../../../../middlewares/auth');
router.get('/', Auth, ctrl.list);
router.post('/', Auth, ctrl.add);
router.put('/', Auth, ctrl.edit);
router.delete('/', Auth, ctrl.remove);
module.exports = router;
