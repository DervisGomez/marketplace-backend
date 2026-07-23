// TODO(v2): Move to Reputation Module.
// La lógica permanece congelada en src/product/record.js durante esta migración.
const Record = require('../../../../product/record');

module.exports = {
    calculate: (id: unknown) => Record.calculate(id)
};
