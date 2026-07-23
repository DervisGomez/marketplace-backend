let router = require('../../../../infrastructure/http/createRouter')(),
    ctrl = require('../../../../../dist/src/modules/denounce/presentation/controllers/denounce.controller');
let Auth = require('../../../../../middlewares/auth');
router.post('/', Auth, ctrl.add);
module.exports = router;
