let router = require('../../../../infrastructure/http/createRouter')(),
    ctrl = require('../../../../../dist/src/modules/chat/presentation/controllers/chat.controller');
let Auth = require('../../../../../middlewares/auth');
router.post('/', Auth, ctrl.newMessage);
router.get('/', Auth, ctrl.meChat);
router.get('/admin', Auth, ctrl.list);
router.get('/find', Auth, ctrl.find);
router.put('/take', Auth, ctrl.take);
router.put('/end', Auth, ctrl.end);
module.exports = router;
