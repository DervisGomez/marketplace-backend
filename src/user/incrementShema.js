let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const IncrementSchema = new Schema({
    number: { type: Number, default: 100000000 },
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('incrimentUser',IncrementSchema);