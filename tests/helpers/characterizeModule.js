const request = require('supertest');
const { createTestApp } = require('./testApp');
const { routeInventory } = require('./routeInventory');
const RequestFactory = require('../factories/request.factory');
const { responseContract } = require('./normalizeResponse');

async function execute(endpoint, authenticated) {
    let operation = request(createTestApp())[endpoint.method](endpoint.path)
        .query(RequestFactory.query())
        .send(RequestFactory.body());
    if (authenticated) operation = operation.set(RequestFactory.authHeaders());
    const response = await operation;

    // `/category/load` responde antes de finalizar sus escrituras async legacy.
    // La espera aísla el siguiente caso sin alterar el código productivo.
    if (endpoint.path === '/api/category/load') {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return response;
}

function characterizeModule(moduleName, options) {
    const settings = options || {};
    const endpoints = routeInventory().filter(route => {
        if (settings.filter) return settings.filter(route);
        return route.module === moduleName;
    });

    describe(`${moduleName} HTTP characterization`, () => {
        it.each(endpoints)('$method $path preserves its observable contract', async endpoint => {
            const response = await execute(endpoint, endpoint.authenticated);
            expect(responseContract(response)).toMatchSnapshot();
        });

        const protectedEndpoints = endpoints.filter(endpoint => endpoint.authenticated);
        it.each(protectedEndpoints)('$method $path preserves legacy authentication rejection', async endpoint => {
            const response = await execute(endpoint, false);
            expect(response.status).toBe(403);
            expect(response.headers['content-type']).toMatch(/^application\/json/);
            expect(response.body).toEqual({ status: 0, data: ['Requiere Token'] });
        });
    });
}

module.exports = { characterizeModule };
