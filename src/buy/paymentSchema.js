let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const PaymentSchema = new Schema({
    type: { type: String },
    amount: { type: Number},
    user: { type: Schema.Types.ObjectId, ref:'user' },
    product: { type: Schema.Types.ObjectId, ref:'product' },
    buy: { type: Schema.Types.ObjectId, ref:'buy' },
    buyer: { type: Schema.Types.ObjectId, ref:'user' },
    photo: { type: String },
    account: { type: Schema.Types.ObjectId, ref:'account' },
    month:{ type:Number },
    status: { type: Number, default : 2 }, //1:activo 2:por descontar 3:por sumar 0:cancelado 4:Por descontar sin reflejar
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('payment',PaymentSchema);