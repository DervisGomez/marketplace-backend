let Denounce = require('./denounceSchema');
let Question = require('../question/questionSchema');

module.exports = {
    add: async (req,res) => {
        try{
            req.body.accuser = req.user._id;
            let newDenounce = new Denounce(req.body);
            let denounce = await newDenounce.save();
            let question = await Question.findByIdAndUpdate(req.body.question,{status:0},{new: true });
            res.status(201).json({status:1,data:question,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
}