let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const denounceSchema = new Schema({
    accuser: {type: Schema.Types.ObjectId, ref:'user' },    
    denounced: {type: Schema.Types.ObjectId, ref:'user' },
    question: {type: Schema.Types.ObjectId, ref:'question' },
    status: { type: Number, default : 1 },
    createdAt : { type: Date, default: Date.now } 
});
module.exports = mongoose.model('denounce', denounceSchema);