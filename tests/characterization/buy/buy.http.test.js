const { characterizeModule } = require('../../helpers/characterizeModule');

characterizeModule('buy', {
    filter: route => route.module === 'buy' && !route.path.match(/^\/api\/buy\/(availability|balance|payment|available|withdrawals)/)
});
