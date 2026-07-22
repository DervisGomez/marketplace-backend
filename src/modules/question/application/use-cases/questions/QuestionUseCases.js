const Question = require('../../../infrastructure/mongoose/repositories/QuestionRepository');
const Notification = require('../../../infrastructure/gateways/QuestionRelationsGateway').Notification;

// TODO(v2): preservar bugs y contratos legacy de Question.
module.exports = {
    new: async (req,res) => {
        try{
            console.log('si');
            req.body.client = req.user._id;
            let questionNew = Question.create(req.body);
            let question = await questionNew.save();
            let notif = Notification.create({
                user:req.body.user,
                title:'Tienes una nueva pregunta',
                description:req.body.question,
                type:'question'
            });
            notification = await notif.save();
            res.status(201).json({status:1,data:{question,notification},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    product: async (req,res) => {
        try{
            console.log('d');
            let count = await Question.countDocuments({product:req.query._id});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = parseInt(req.query.skip)*parseInt(req.query.limit);
            let questions = await Question.find({product:req.query._id }).populate('client',{userName:1,createdAt:1,recordBuyer:1}).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(201).json({status:1,data:{questions,numPages},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    user: async (req,res) => {
        try{
            let count = await Question.countDocuments({user:req.user._id, status:1});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let questions = await Question.find({user:req.user._id, status:1}).populate('client',{userName:1,createdAt:1,photo:1,recordBuyer:1}).populate('product').skip(skip).limit(parseInt(req.query.limit)).sort({$natural:1});
            
            let questions2 = [];
            for (let i = 0; i < questions.length; i++) {
                let save = true;
                if(questions[i].client){
                    let client = questions[i].client._id;
                    let product = questions[i].product._id;
                    for (let e = 0; e < questions2.length; e++) {
                        if(questions2[e].client._id == client && questions2[e].product._id == product){
                            save = false
                        }                    
                    }
                    if(save){
                        questions2.push(questions[i]);
                    }                    
                }                
            }
            
            //console.log(questions);
            /*let questions2 = await Question.aggregate([
                { $sort: {createdAt:-1} },
                { $skip : skip },
                { $limit: parseInt(req.query.limit) },
                { $match : {user:ObjectId(req.query._id), status:1} },
                {
                    $group: {
                        _id: {
                            products: "$product",
                            client:"$client"
                        },
                        count: {
                            $sum: 1
                        },
                        questions: {
                            $first: "$question"
                        }
                    }
                },
                {$lookup:{ from: 'user', localField: 'client', foreignField: 'name', as: 'products' }}
            ]);*/
            res.status(201).json({status:1,data:{questions2:questions2,numPages,questions:questions},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    client: async (req,res) => {
        try{
            let count = await Question.countDocuments({client:req.user._id});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let questions = await Question.find({client:req.user._id}).populate('user',{userName:1,createdAt:1,photo:1,record:1}).populate('product').skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            
            let questions2 = [];
            /*for (let i = 0; i < questions.length; i++) {
                let save = true;
                if(questions[i].client){
                    let client = questions[i].client._id;
                    let product = questions[i].product._id;
                    for (let e = 0; e < questions2.length; e++) {
                        if(questions2[e].client._id == client && questions2[e].product._id == product){
                            save = false
                        }                    
                    }
                    if(save){
                        questions2.push(questions[i]);
                    }                    
                }                
            }*/
            res.status(201).json({status:1,data:{numPages,questions:questions},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    productClient: async (req,res) => {
        try{
            console.log('dh');
            let count = await Question.countDocuments({product:req.query.product,client:req.query.client,createdAt:{$lt:req.query.date},status:1});
            let numPages = parseInt((count/req.query.limit)+1);
            let skip = parseInt(req.query.skip)*parseInt(req.query.limit);
            let questions = await Question.find({product:req.query.product,client:req.query.client,createdAt:{$lt:req.query.date},status:1 }).populate('client',{userName:1,createdAt:1,recordBuyer:1}).populate('product').skip(skip).limit(parseInt(req.query.limit)).sort({$natural:1});
            res.status(201).json({status:1,data:{questions,numPages},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
};
