let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const categorySchema = new Schema({
    name: { type: String, required:true },
    subcategory: {type: Array},
    status: { type: Number, default : 1 },
    father: {type: Number, default:0 },
    createdAt : { type: Date, default: Date.now }
});
module.exports = mongoose.model('category', categorySchema);