let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const AccountSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    bank: { type: Schema.Types.ObjectId, ref:'bank' },
    number: { type: String, required: [true, 'Número de cuenta es obligatorio.'] },
    type: {type: String, required: [true, 'Tipo de cuenta es obligatorio.'] },
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('account',AccountSchema);