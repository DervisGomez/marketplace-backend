let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const ProductSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    title: { type: String, required: [true, 'Titulo es obligatorio.'] },
    model: { type: String },
    brand: { type: String },
    number: { type: Number },
    price: { type: Number, required: [true, 'Precio es obligatorio.'] },
    quantity: { type: Number, required: [true, 'Cantidad es obligatorio.'] },
    category: { type: Schema.Types.ObjectId, ref:'category', required: [true, 'Categoria es obligatorio.'] },
    subcategory: { type: Schema.Types.ObjectId, ref:'category', required: [true, 'Subcategoria es obligatorio.'] },
    condition: { type: String, required: [true, 'Condición es obligatorio.'] },
    images: { type: Array },
    quantitySold: { type: Number, default : 0 },
    city: { type: String },
    department: { type: String },
    favorite: { type: Array },
    description: { type: String },
    video: { type: String },
    deliver: {type:Boolean},
    visits: { type: Number, default:0},    
    warrantyType: { type: String },
    warrantyTime: { type: Number },
    highlight: { type: String },
    month:{ type:Number },
    year: { type:Number },
    status: { type: Number, default : 1 },
    createdAt: { type: Date, default: Date.now }
});
ProductSchema.index({ title: 'text'})
module.exports = mongoose.model('product',ProductSchema);