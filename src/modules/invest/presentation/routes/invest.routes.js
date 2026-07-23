let router = require('../../../../infrastructure/http/createRouter')(),
    ctrl = require('../../../../../dist/src/modules/invest/presentation/controllers/invest.controller');
let Auth = require('../../../../../middlewares/auth');
router.post('/', Auth, ctrl.add);
module.exports = router;
