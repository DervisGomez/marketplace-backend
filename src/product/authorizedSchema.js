let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const AuthorizedSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    name: { type: String },
    typeIdentification: { type: String },
    identification: { type: String },
    phone: { type: String },
    predetermined: { type: Number },
    address: { type: String},
    department: { type: String },
    city: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('authorized',AuthorizedSchema);