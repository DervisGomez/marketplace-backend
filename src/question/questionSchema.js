let mongoose = require('mongoose'),
Schema = mongoose.Schema;
const QuestionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'user' },
    product: { type: Schema.Types.ObjectId, ref:'product' },
    client: { type: Schema.Types.ObjectId, ref:'user' },
    question: { type: String, required: [true, 'Pregunta es obligatorio.'] },
    answer: { type: String },
    status: { type: Number, default : 1 },
    answerAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('question',QuestionSchema);