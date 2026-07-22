let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    title: { type: String, required:true },
    description: { type: String, required:true },
    type: { type: String, required:true },
    photo: { type: String },
    status: { type: Number, default : 1 },
    createdAt : { type: Date, default: Date.now }
});
module.exports = mongoose.model('nofication', notificationSchema);