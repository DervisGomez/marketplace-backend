let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const MessageChatSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    chat: { type: Schema.Types.ObjectId, ref:'chat' },
    message: { type: String },
    type: { type: String },
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('messageChat',MessageChatSchema);