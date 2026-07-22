const Notification = require('../../../infrastructure/mongoose/repositories/NotificationRepository');

// TODO(v2): preservar bugs y contratos legacy de Notification.
module.exports = {
    find: async (req,res) => {
        try{
            let notification = await Notification.update({_id:req.body._id},{$set:{status:3}},{multi:true});
            res.status(201).json({status:1,data:{notification}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    }
};
