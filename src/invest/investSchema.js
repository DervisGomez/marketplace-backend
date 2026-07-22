let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const InvestSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    hour: { type: String, required: [true, 'Nombre es obligatorio.']  },
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('invest',InvestSchema);