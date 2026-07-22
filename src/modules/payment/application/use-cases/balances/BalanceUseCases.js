const Payment = require('../../../infrastructure/mongoose/repositories/PaymentRepository');
const Relations = require('../../../infrastructure/gateways/PaymentRelationsGateway');
const Buy = Relations.Buy;
const Question = Relations.Question;
const Account = Relations.Account;
const toObjectId = require('../../../infrastructure/mongoose/repositories/MongoObjectId');
const ReputationGateway = require('../../../infrastructure/gateways/LegacyReputationGateway');

const productData = {title:1,images:1,price:1, quantitySold:1,city:1,department:1,favorite:1,visits:1,status:1,condition:1,warrantyType:1,warrantyTime:1};
const userData = {password:0,passwordFailures:0,status:0,__v:0};

// TODO(v2): preservar bugs y contratos del flujo Payment legacy.
module.exports = {
    availability: async (req, res) =>{
        try{
            group = { type: "$type" };
            let match = {user:toObjectId(req.user._id),status:1};
            let money = await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            res.status(200).json({status:1,data:{money},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    balance: async (req, res) => {
        try {
            let group = { type: "$type",status:'$status' };
            let match = {user:toObjectId(req.user._id),type:'veco'};
            let money = await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            console.log(money);

            let entry = 0;
            let egress = 0;

            group = { type: "$type" };
            match = {user:toObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$gt:0},type:'referred'};
            let referred= await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            match = {user:toObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$lt:0},type:'referred'};
            let referred2= await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            if(referred.length>0) entry = referred[0].count;
            if(referred2.length>0) egress = referred2[0].count;

            let date = new Date();
            date.setDate(date.getDate() - 31);

            let sales = await Buy.find({user:req.user._id,$or:[{status:1},{status:2}],createdAt:{$gt:date}}).populate('product',productData).populate('buyer',userData);
            let purchase = await Buy.find({buyer:req.user._id,$or:[{status:1},{status:2}],createdAt:{$gt:date}}).populate('product',productData).populate('user',userData);

            let questionSales = await Question.countDocuments({user:toObjectId(req.user._id),status:1});
            let questionPurchase = await Question.countDocuments({client:toObjectId(req.user._id),status:1});

            let qualifyBuyer = await Buy.countDocuments({buyer:toObjectId(req.user._id),qualifySeller:'none'});
            let qualifySeller = await Buy.countDocuments({user:toObjectId(req.user._id),qualifyBuyer:'none'});

            let date2 = new Date();
            date2.setDate(date2.getDate() - 10);
            let noqualifyBuyer = await Buy.countDocuments({buyer:toObjectId(req.user._id),qualifySeller:'none',report:0,createdAt:{$lt:date2}});
            let noqualifySeller = await Buy.countDocuments({user:toObjectId(req.user._id),qualifyBuyer:'none',createdAt:{$lt:date2}});

            let record = await ReputationGateway.info(toObjectId(req.user._id));
            let recordBuyer = await ReputationGateway.infoBuyer(toObjectId(req.user._id))
            
            res.status(200).json({status:1,data:{money,sales,purchase,entry,egress,questionSales,questionPurchase,record,recordBuyer,qualifySeller,noqualifyBuyer,noqualifySeller,qualifyBuyer},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    available: async (req, res) => {
        try {
            let group = { type: "$type",status:'$status' };
            let match = {user:toObjectId(req.user._id),type:'veco',$or:[{status:1},{status:2}]};
            let money = await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            let account = await Account.find({user:req.user._id}).populate('bank');

            res.status(200).json({status:1,data:{money,account},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
};
