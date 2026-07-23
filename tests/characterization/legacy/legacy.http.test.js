const { characterizeModule } = require('../../helpers/characterizeModule');

for (const moduleName of ['root']) {
    characterizeModule(moduleName);
}
