let router = require('../../../../infrastructure/http/createRouter')(),
    ctrl = require('../../../../../dist/src/modules/bank/presentation/controllers/bank.controller');
let Auth = require('../../../../../middlewares/auth');
router.get('/', Auth, ctrl.list);
router.post('/', Auth, ctrl.add);
router.put('/', Auth, ctrl.edit);
router.delete('/', Auth, ctrl.remove);
module.exports = router;
