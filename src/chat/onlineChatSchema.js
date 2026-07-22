let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const MessageChatSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    admin: { type: Schema.Types.ObjectId, ref:'user' },
    message: [{ type: Schema.Types.ObjectId, ref:'messageChat' }],
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('chat',MessageChatSchema);