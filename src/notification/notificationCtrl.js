let Notification = require('./notificationSchema');

module.exports = {
    list:async (req,res) => {
        try{
            let filter = {status:1};
            let count = await Notification.aggregate([
                { $match : filter },
                { $group: { _id: { status: "$status" }, count: { $sum: 1 } } }
            ]);
            let notification = await Notification.find({user:req.user._id,$or:[{status:1},{status:2}]}).limit(20);
            if(count.length>0){
                let counts = count[0].count;
                res.status(201).json({status:1,data:{notification,counts}});
            }else{
                res.status(201).json({status:1,data:{notification,counts:0}});
            }
            
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    view: async (req,res) => {
        try{
            let notification = await Notification.update({status:1},{$set:{status:2}},{multi:true});
            res.status(201).json({status:1,data:{notification}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    find: async (req,res) => {
        try{
            let notification = await Notification.update({_id:req.body._id},{$set:{status:3}},{multi:true});
            res.status(201).json({status:1,data:{notification}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    }
}