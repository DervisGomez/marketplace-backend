let router = require('./infrastructure/http/createRouter')();
let userRouter = require('./user/userRouter');
let categoryRouter = require('./category/categoryRouter');
let productRouter = require('./product/productRouter');
let questionRouter = require('./question/questionRouter');
let denounceRouter = require('./denounce/denounceRouter');
let notificationRouter = require('./notification/notificationRouter');
let buyRouter = require('./buy/buyRouter');
let bankRouter = require('./bank/bankRouter');
let accountRouter = require('./account/accountRouter');
let investRouter = require('./invest/investRouter');
let chatRouter = require('./chat/chatRouter');

router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/question', questionRouter);
router.use('/denounce', denounceRouter);
router.use('/notification', notificationRouter);
router.use('/buy', buyRouter);
router.use('/bank', bankRouter);
router.use('/account', accountRouter);
router.use('/invest', investRouter);
router.use('/chat', chatRouter);

router.get('/', (req, res, next) => {
    res.send('api MLOLX las rutas de los end point deben seguir la regla :  /api/url');
});

module.exports = router;
