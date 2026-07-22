let express = require('express'),
    router = require('express-promise-router')(),
    ctrl = require('../controllers/product.controller');
let Auth = require('../../../../../middlewares/auth');

router.post('/',Auth,ctrl.new);

router.put('/',Auth,ctrl.edit);

router.put('/pause',Auth,ctrl.pause);

router.put('/start',Auth,ctrl.start);

router.get('/',Auth,ctrl.me);

router.get('/user',ctrl.user);

router.get('/query',ctrl.query);

router.get('/number',ctrl.queryNumber);

router.get('/query-find',Auth,ctrl.queryFind);

router.get('/find',Auth,ctrl.find);

router.get('/category',ctrl.category);

router.get('/subcategory',ctrl.subcategory);

router.get('/filter',ctrl.filter);

router.get('/search',ctrl.search);

router.get('/keywords',ctrl.keywords);

router.post('/favorite',Auth,ctrl.favoriteAdd);

router.delete('/favorite',Auth,ctrl.favoriteRemove);

router.get('/favorite',Auth,ctrl.favorite);

router.get('/operations',Auth,ctrl.operations);

router.get('/outstanding',ctrl.outstanding);

router.get('/last',ctrl.last);

router.get('/sold',ctrl.sold);

router.get('/increment',ctrl.createIncrement);

module.exports = router;
