let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const MessageSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    buy: { type: Schema.Types.ObjectId, ref:'buy' },
    message: { type: String },
    type: { type: String },
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('messageBuy',MessageSchema);