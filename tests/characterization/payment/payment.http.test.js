const { characterizeModule } = require('../../helpers/characterizeModule');

const paymentPaths = /^\/api\/buy\/(availability|balance|payment(?:\/|$)|available|withdrawals)/;

characterizeModule('payment', {
    filter: route => route.module === 'buy' && paymentPaths.test(route.path)
});

describe('payment router facade', () => {
    it('preserves the nine currently declared routes', () => {
        const router = require('../../../src/payment/paymentRouter');
        const routes = router.stack.filter(layer => layer.route).map(layer => ({
            method: Object.keys(layer.route.methods)[0],
            path: layer.route.path,
            middleware: layer.route.stack.length
        }));
        expect(routes).toMatchInlineSnapshot(`
          [
            {
              "method": "get",
              "middleware": 2,
              "path": "/availability",
            },
            {
              "method": "get",
              "middleware": 2,
              "path": "/balance",
            },
            {
              "method": "get",
              "middleware": 2,
              "path": "/payment",
            },
            {
              "method": "get",
              "middleware": 2,
              "path": "/available",
            },
            {
              "method": "post",
              "middleware": 2,
              "path": "/withdrawals",
            },
            {
              "method": "get",
              "middleware": 2,
              "path": "/withdrawals",
            },
            {
              "method": "get",
              "middleware": 2,
              "path": "/payment/pendings",
            },
            {
              "method": "get",
              "middleware": 2,
              "path": "/payment/executed",
            },
            {
              "method": "post",
              "middleware": 2,
              "path": "/payment/process",
            },
          ]
        `);
    });
});
