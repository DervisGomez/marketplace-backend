// TODO(v2): Move to Reputation Module.
const Record = require('../../../../product/record');

module.exports = {
    info: id => Record.info(id),
    infoBuyer: id => Record.infoBuyer(id)
};
