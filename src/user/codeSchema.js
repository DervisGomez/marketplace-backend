let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const codeSchema = new Schema({
    medium: { type: String, unique: true, required: [true, 'Celular es obligatorio.']},
    code: { type: String, required: [true, 'Código de Recuperación es obligatorio.']},
    createdAt : { type: Date, default: Date.now, index: { unique: true, expires: '1d'} }
});
module.exports = mongoose.model('code',codeSchema);