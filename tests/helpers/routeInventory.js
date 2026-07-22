const mounts = [
    ['user', '/api/user', '../../src/user/userRouter'],
    ['category', '/api/category', '../../src/category/categoryRouter'],
    ['product', '/api/product', '../../src/product/productRouter'],
    ['question', '/api/question', '../../src/question/questionRouter'],
    ['denounce', '/api/denounce', '../../src/denounce/denounceRouter'],
    ['notification', '/api/notification', '../../src/notification/notificationRouter'],
    ['buy', '/api/buy', '../../src/buy/buyRouter'],
    ['bank', '/api/bank', '../../src/bank/bankRouter'],
    ['account', '/api/account', '../../src/account/accountRouter'],
    ['invest', '/api/invest', '../../src/invest/investRouter'],
    ['chat', '/api/chat', '../../src/chat/chatRouter']
];

function cleanPath(base, path) {
    const suffix = path === '/' ? '' : path;
    return base + suffix;
}

function routeInventory() {
    const routes = [{ module: 'root', method: 'get', path: '/api', authenticated: false }];

    for (const [module, base, routerPath] of mounts) {
        const router = require(routerPath);
        for (const layer of router.stack) {
            if (!layer.route) continue;
            const methods = Object.keys(layer.route.methods);
            for (const method of methods) {
                routes.push({
                    module,
                    method,
                    path: cleanPath(base, layer.route.path),
                    authenticated: layer.route.stack.length > 1
                });
            }
        }
    }

    return routes;
}

module.exports = { mounts, routeInventory };
