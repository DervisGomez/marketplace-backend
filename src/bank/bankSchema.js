let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const BankSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    name: { type: String, required: [true, 'Nombre es obligatorio.']  },
    logo: { type: String, required: [true, 'Logo es obligatorio.']  },
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('bank',BankSchema);