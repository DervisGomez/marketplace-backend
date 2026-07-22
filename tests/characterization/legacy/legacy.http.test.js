const { characterizeModule } = require('../../helpers/characterizeModule');

for (const moduleName of ['root', 'category', 'denounce', 'bank', 'account', 'invest', 'chat']) {
    characterizeModule(moduleName);
}
