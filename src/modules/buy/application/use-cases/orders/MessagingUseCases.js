const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');
const Message = require('../../../infrastructure/mongoose/repositories/MessageRepository');
const FileGateway = require('../../../infrastructure/gateways/LegacyFileGateway');

// TODO(v2): preservar los bugs conocidos hasta una fase funcional.
module.exports = {
    newComment: async (req, res) =>{
        try{
            if(req.type == 'img'){
                req.body.message == await FileGateway.uploadImage(image);
            }
            let newComment = await Message.create(req.body);
            let comment = await newComment.save();
            await Buy.findByIdAndUpdate(req.body.buy,{$addToSet: {
                messages:comment._id
            }},{multi:true})
            res.status(201).json({status:1,data:comment,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    replyComment: async (req, res) =>{
        try{
            let comment = await Message.findByIdAndUpdate(req.body._id,req.body);
            res.status(200).json({status:1,data:comment,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    listComment: async (req, res) =>{
        try{
            let comment = await Message.find({buy:req.query._id,}).sort({$natural:-1});
            res.status(200).json({status:1,data:comment,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
};
