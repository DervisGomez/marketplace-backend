const Product = require('../../../infrastructure/mongoose/repositories/ProductRepository');
const Relations = require('../../../infrastructure/mongoose/repositories/ProductRelationsRepository');
const Buy = Relations.Buy;
const Question = Relations.Question;
const User = Relations.User;
const Payment = Relations.Payment;
const Authorized = Relations.Authorized;
const toObjectId = require('../../../infrastructure/mongoose/repositories/MongoObjectId');
const ReputationGateway = require('../../../infrastructure/reputation/LegacyReputationGateway');

const productData = {title:1,images:1,price:1, quantitySold:1,city:1,department:1,favorite:1,visits:1,status:1,number:1};
const categoryData = {createdAt:0,status:0,__v:0, subcategory:0};
const userData = {password:0,passwordFailures:0,status:0,__v:0};
const productData2 = {createdAt:0,status:0,__v:0};

// TODO(v2): los bugs documentados se preservan para mantener compatibilidad.
module.exports = {
    me: async (req,res) => {
        try{
            let group = { status:'$status' };
            let match = {user:toObjectId(req.user._id)};
            let counts = await Product.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            let count = await Product.countDocuments({user:req.user._id,status:req.query.status});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)
            let product = await Product.find({user:req.user._id,status:req.query.status},productData).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(200).json({status:1,data:{product,numPages,counts},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    user: async (req,res) => {
        try{
            let count = await Product.countDocuments({user:req.query.user});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)
            let product = await Product.find({user:req.query.user,status:1},productData).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            let user = await User.findById(req.query.user);
            res.status(200).json({status:1,data:{product,numPages,user},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    query: async (req,res) => {
        try{
            let product = await Product.findById(req.query._id,productData2).populate('user',userData).populate('category',categoryData).populate('subcategory');
            if(product.user._id!=req.query.user){
                await Product.findByIdAndUpdate(product._id, {$inc: {visits: 1}})
            }
            let questions = await Question.find({product:product._id, status:{$ne:0}}).populate('client',{name:1,lastName:1}).skip(0).limit(parseInt(req.query.limit)).sort({$natural:-1});
            let others = await Product.find({user:product.user._id,status:1,_id:{$ne:req.query._id}},productData).sort({$natural:-1}).limit(4);
            group = { type: "$qualifySeller" };            
            let match = {user:product.user._id};
            let sales = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            let record = await ReputationGateway.calculate(product.user._id);
            res.status(200).json({status:1,data:{product, others, questions, sales,record},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    queryNumber: async (req,res) => {
        try{
            let products = await Product.find({number:req.query.number},productData2).populate('user',userData).populate('category',categoryData).populate('subcategory');
            if(products.length > 0){
                let product = products[0];
                if(product.user._id!=req.query.user){
                    await Product.findByIdAndUpdate(product._id, {$inc: {visits: 1}})
                }
                let questions = await Question.find({product:product._id, status:{$ne:0}}).populate('client',{name:1,lastName:1}).skip(0).limit(parseInt(req.query.limit)).sort({$natural:-1});
                let others = await Product.find({user:product.user._id,status:1,_id:{$ne:req.query._id}},productData).sort({$natural:-1}).limit(4);
                group = { type: "$qualifySeller" };            
                let match = {user:product.user._id};
                let sales = await Buy.aggregate([
                    { $match : match },
                    { $group: { _id: group, count: { $sum: 1 } } }
                ]);
                let record = await ReputationGateway.calculate(product.user._id);
                res.status(200).json({status:1,data:{product, others, questions, sales,record},token:req.token});
            }else{
                res.status(201).json({ status:0,data:'Product no encontrada', token: req.token})
            }
            
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    queryFind: async (req,res) => {
        try{
            let product = await Product.findById(req.query._id,productData2).populate('user',{city:1,department:1});
            let record = await ReputationGateway.calculate(product.user._id);
            let group = { type: "$type" };
            let match = {user:toObjectId(req.user._id),$or:[{status:1},{status:2}]};
            let money = await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            let authorized = await Authorized.find({user:req.user._id}).sort({predetermined:-1});
            res.status(200).json({status:1,data:{product,record,money,authorized},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    find: async (req,res) => {
        try{
            let product = await Product.findById(req.query._id,productData2).populate('category',categoryData).populate('subcategory');
            res.status(200).json({status:1,data:{product},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
};
