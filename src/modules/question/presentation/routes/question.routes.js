let router = require('../../../../infrastructure/http/createRouter')(),
    ctrl = require('../controllers/question.controller');
let Auth = require('../../../../../middlewares/auth');

router.post('/', Auth, ctrl.new);

router.post('/answer', Auth, ctrl.answer);

router.get('/', ctrl.product);

router.get('/me', Auth, ctrl.user);

router.get('/me/client', Auth, ctrl.client);

router.get('/client', ctrl.productClient);

router.delete('/', Auth, ctrl.delete);

router.delete('/lock', Auth, ctrl.lock);

module.exports = router;
