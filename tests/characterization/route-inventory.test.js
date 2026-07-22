const { routeInventory } = require('../helpers/routeInventory');

describe('HTTP route inventory', () => {
    it('protects every mounted endpoint and its middleware shape', () => {
        const routes = routeInventory();
        const identities = routes.map(route => `${route.method.toUpperCase()} ${route.path}`);

        expect(new Set(identities).size).toBe(identities.length);
        expect(routes).toHaveLength(134);
        expect(routes).toMatchSnapshot();
    });
});
