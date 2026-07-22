const Question = require('../../../infrastructure/mongoose/repositories/QuestionRepository');
const User = require('../../../infrastructure/gateways/QuestionRelationsGateway').User;

// TODO(v2): preservar bugs y contratos legacy de Question.
module.exports = {
    lock: async (req,res) => {
        try{
            req.query.status = 0;
            let question = await Question.findByIdAndUpdate(req.query._id,req.query,{new: true });
            let user = await User.findByIdAndUpdate(req.query.user,{$addToSet :{complaints:req.user._id}});
            res.status(201).json({status:1,data:question,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    delete: async (req,res) => {
        try{
            req.query.status = 0;
            let question = await Question.findByIdAndUpdate(req.query._id,req.query,{new: true });
            res.status(201).json({status:1,data:question,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
};
