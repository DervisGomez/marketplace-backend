const ObjectId = require('mongoose').Types.ObjectId;

module.exports = value => new ObjectId(value);
