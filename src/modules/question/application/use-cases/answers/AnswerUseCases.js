const Question = require('../../../infrastructure/mongoose/repositories/QuestionRepository');

// TODO(v2): preservar bugs y contratos legacy de Question.
module.exports = {
    answer: async (req,res) => {
        try{
            req.body.status = 2; 
            req.body.answerAt = new Date();
            let question = await Question.findByIdAndUpdate(req.body._id,req.body,{new: true });
            //await Question.update({product:question.product,client:question.client});
            res.status(201).json({status:1,data:question,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
};
