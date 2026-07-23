let router = require('../infrastructure/http/createRouter')(),
    ctrl = require('./denounce.Ctrl');
let Auth = require('../../middlewares/auth');

router.post('/', Auth, ctrl.add);

module.exports = router;
