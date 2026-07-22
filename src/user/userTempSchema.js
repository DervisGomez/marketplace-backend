let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const UserTempSchema = new Schema({
    name: { type: String, required: [true, 'Nombre es obligatorio.']},
    lastName: { type: String, required: [true, 'Apellido es obligatorio.']},
    userName: { type: String, required: [true, 'Usuario es obligatorio.']},
    birthdate: { type: Date, required: [true, 'Fecha de nacimiento es obligatorio.'] },
    month: Number,
    day: Number,
    phone: { type: String, unique: true, required: [true, 'Celular es obligatorio.'],match:[
        /^\d{12}$/,
        'Número de teléfono invalido'
    ]},    
    password: { type: String, required: [true, 'Contraseña es obligatorio.']},
    identification: { type: String,required: [true, 'Cedula es obligatorio']},
    email: { type: String, uniqe:true, required: [true, 'Correo es obligatorio']},
    department: { type: String, required: [true,'Departamento es obligatorio']},
    city: { type: String, required: [true,'Ciudad es obligatorio']},
    referred: { type: Schema.Types.ObjectId, ref:'user'},
    codeRegister: { type: String, required: [true, 'Código de Registro es obligatorio.']},
    createdAt : { type: Date, default: Date.now, index: { unique: true, expires: '1d'} }
});
module.exports = mongoose.model('userTemp',UserTempSchema);