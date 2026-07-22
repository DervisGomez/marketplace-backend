const User = require('../repositories/UserRepository');
const Payment = require('../repositories/MarketplaceRepository').Payment;
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Casos de uso de Referral.
 * Sus dependencias se limitan a repositorios y adaptadores requeridos por estos flujos.
 */
module.exports = {
    referred: async (req, res) =>{
        try {
            let group = { type: "$type" };
            let match = {user:ObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$gt:0},type:'referred'};
            let entry= await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            match = {user:ObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$lt:0},type:'referred'};
            let egress= await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            let referred = await User.find({referred:req.user._id},{name:1,lastName:1,photo:1,balanceReferred:1,createdAt:1,userName:1,city:1,department:1})
            res.status(200).json({status:1,data:{referred,entry,egress}});
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    }
};
