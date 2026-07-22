let Buy = require('./buySchema');
let Message = require('./messageSchema')
let Product = require('../product/productSchema');
let User = require('../user/userSchema');
let Increment = require('./incrementShema');
let mongoose = require('mongoose');
let Record = require('../product/record');
let Payment = require('./paymentSchema');
let Account = require('../account/accountSchema');
let Question = require('../question/questionSchema');
let Bank = require('../bank/bankSchema');
let Files = require('../file/fileCtrl');
let Authorized = require('../product/authorizedSchema');

const ObjectId = mongoose.Types.ObjectId;
let productData = {title:1,images:1,price:1, quantitySold:1,city:1,department:1,favorite:1,visits:1,status:1,condition:1,warrantyType:1,warrantyTime:1};
let userData = {password:0,passwordFailures:0,status:0,__v:0};

module.exports = {
    createIncrement:async (req, res) =>{
        let increment = new Increment();
        increment = await increment.save();
        res.status(201).json({status:1,data:increment});
    },
    new: async (req,res) => {
        try{
            let increment = await Increment.findOneAndUpdate({status:1},{$inc: {number: 1 } },{new: true });
            req.body.number = increment.number;
            req.body.month = new Date().getMonth();
            req.body.year = new Date().getFullYear();
            let newBuy = new Buy(req.body);            
            let buy = await newBuy.save();
            console.log(buy); 

            let vecoSeller = 0;//veco por habilitar
            let vecoSellerCash = 0;//veco por habilitar pero no se refleja
            let veco = 0;
            let vecoBuyer = 0;//veco por descontar
            let referredBuyer = 0; //referred por descontar
            for (let i = 0; i < req.body.payment.length; i++) {
                const element = req.body.payment[i];
                switch(element.type){
                    case 'payu':{
                        vecoSeller = vecoSeller + element.amount*(100-parseInt(req.body.percent))/100;
                        //veco = veco + element.amount*parseInt(req.body.percent)/100;
                        break;
                    }
                    case 'veco':{
                        vecoBuyer = vecoBuyer - element.amount;
                        vecoSeller = vecoSeller + element.amount*(100-parseInt(req.body.percent))/100;
                        //veco = veco + element.amount*parseInt(req.body.percent)/100;
                        break;
                    }
                    case 'referred':{
                        referredBuyer = referredBuyer - element.amount;
                        vecoSeller = vecoSeller + element.amount*(100-parseInt(req.body.percent))/100;
                        //veco = veco + element.amount*parseInt(req.body.percent)/100;
                        break;
                    }
                    case 'cash':{
                        vecoSellerCash = vecoSellerCash - element.amount*parseInt(req.body.percent)/100;
                        //veco = veco + element.amount*parseInt(req.body.percent)/100;
                        break;
                    }
                }
            }
            if(vecoSellerCash!=0){
                let payment = new Payment({type:'veco',amount:vecoSellerCash,user:buy.user,buy:buy._id,product:buy.product,status:4,createdAt:new Date()})
                await payment.save();
            }
            if(vecoSeller!=0){
                let payment = new Payment({type:'veco',amount:vecoSeller,user:buy.user,buy:buy._id,product:buy.product,status:3,createdAt:new Date()})
                await payment.save();
            }
            if(vecoBuyer!=0){
                let payment = new Payment({type:'veco',amount:vecoBuyer,user:buy.buyer,buy:buy._id,product:buy.product,createdAt:new Date()})
                await payment.save();
            }
            if(referredBuyer!=0){
                let payment = new Payment({type:'referred',amount:referredBuyer,user:buy.buyer,product:buy.product,buy:buy._id,createdAt:new Date()})
                await payment.save();
            }


            let productQuantity =await Product.findByIdAndUpdate(buy.product, {$inc: {quantity: (buy.quantity*-1)}},{new:true});
            if(productQuantity.quantity == 0){
                await Product.findByIdAndUpdate(buy.product,{status:2})
            }
            await Product.findByIdAndUpdate(buy.product, {$inc: {quantitySold: buy.quantity}});
            console.log('New',req.body.dataSend)
            if(req.body.dataSend == 'new'){
                let authorized = new Authorized({
                    user:req.user._id,
                    name: req.body.name,
                    identification: req.body.identification,
                    phone: req.body.phone,
                    predetermined: Date.now(),
                    address: req.body.address,
                    department: req.body.department,
                    city: req.body.city,
                })
                await authorized.save();
            }else{
                await Authorized.findByIdAndUpdate(req.body.dataSend,{predetermined: Date.now()})
            }

            res.status(201).json({status:1,data:buy,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    find: async (req, res) => {
        try{
            console.log('data');
            let buy = await Buy.findById(req.query._id).populate('product',productData).populate('user',userData).populate('buyer',userData);
            let question = await Question.find({product:buy.product._id,client:buy.buyer._id}).limit(10).sort({$natural:-1});
            res.status(201).json({ status:1,data:{ buy, question }, token: req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    findNumber: async (req, res) => {
        try{
            let buy = await Buy.find({number:req.query.number}).populate('product',productData).populate('user',userData).populate('buyer',userData).populate('messages');
            if(buy.length >0){
                let question = await Question.find({product:buy[0].product._id,client:buy[0].buyer._id}).limit(10).sort({$natural:-1});
                res.status(201).json({ status:1,data:{ buy, question }, token: req.token});
            }else{
                res.status(201).json({ status:0,data:'Compra/Venta no encontrada', token: req.token});
            }
            
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    purchases: async (req, res) =>{
        try{
            let group = { status:'$status' };
            let match = {buyer:ObjectId(req.user._id)};
            let counts = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            let count = await Buy.countDocuments({buyer:req.user._id,status:req.query.status});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let buy = await Buy.find({buyer:req.user._id,status:req.query.status}).populate('messages').populate('product',productData).populate('user',userData).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(201).json({status:1,data:{buy,counts},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    purchasesDate: async (req, res) =>{
        try{
            let date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            switch(req.query.date){
                case 'today':
                    break;
                case 'sevenDays':
                    date.setDate(date.getDate()-7);
                    break;
                case 'fifteenDays':
                    date.setDate(date.getDate()-15);
                    break;
                case 'thirtyDays':
                    date.setDate(date.getDate()-30);
                    break
            }
            let buy = await Buy.find({buyer:req.user._id,status:2,createdAt:{$gt:date}}).populate('messages').populate('product',productData).populate('user',userData).sort({$natural:-1});
            res.status(201).json({status:1,data:buy,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    sale: async (req, res) =>{
        try{            
            let group = { status:'$status' };
            let match = {user:ObjectId(req.user._id)};
            let counts = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            let count = await Buy.countDocuments({user:req.user._id,status:req.query.status});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let buy = await Buy.find({user:req.user._id,status:req.query.status}).populate('messages').populate('product',productData).populate('buyer',userData).populate('user',userData).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(201).json({status:1,data:{buy,counts},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    saleDate: async (req, res) =>{
        try{
            let date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            switch(req.query.date){
                case 'today':
                    break;
                case 'sevenDays':
                    date.setDate(date.getDate()-7);
                    break;
                case 'fifteenDays':
                    date.setDate(date.getDate()-15);
                    break;
                case 'thirtyDays':
                    date.setDate(date.getDate()-30);
                    break
            }
            let buy = await Buy.find({user:req.user._id,status:2,createdAt:{$gt:date}}).populate('messages').populate('product',productData).populate('buyer',userData).populate('user',userData).sort({$natural:-1});
            res.status(201).json({status:1,data:buy,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    qualifyBuyer: async(req, res) =>{
        try{
            let data = {
                qualifyBuyer:req.body.qualify,
                buyerComment:req.body.comment,
                createdBuyer: new Date()
            }
            let buy = await Buy.findByIdAndUpdate(req.body._id,data);
            console.log(buy);
            if(req.body.qualify=='positive'){
                await User.findByIdAndUpdate(buy.buyer, {$inc: {recordBuyer: 1}})
            }else{
                await User.findByIdAndUpdate(buy.buyer, {$inc: {recordBuyer: -1}})
            }
            res.status(201).json({status:1,data:buy,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    qualifySeller: async(req, res) =>{
        try{
            let data = {
                qualifySeller:req.body.qualify,
                sellerComment:req.body.comment,
                status:2,
                createdSeller: new Date()
            }
            let buy = await Buy.findByIdAndUpdate(req.body._id,data);


            await Payment.update({buy:req.body._id},{status:1}, {"multi": true});

            let user =''
            if(req.body.qualify=='positive'){
                user = await User.findByIdAndUpdate(buy.user, {$inc: {record: 1}})
            }else{
                user = await User.findByIdAndUpdate(buy.user, {$inc: {record: -1}})
            }
            console.log(req.user);
            if(req.user.referred){
                await User.findByIdAndUpdate(req.user._id, {$inc: {balanceReferred: buy.total*2/100}});
                let payment = new Payment({type:'referred',amount:buy.total*2/100,user:req.user.referred,buy:buy._id,product:buy.product,buyer:req.user._id,status:1});
                let pay =await payment.save();
                console.log(pay);
            }

            res.status(201).json({status:1,data:buy,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    recordBuyer: async(req, res) => {        
        try{
            group = { type: "$qualifyBuyer" };
            console.log(req.query._id);
            let match = {buyer:ObjectId(req.query._id)};
            let sales = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);            
            res.status(200).json({status:1,data:sales,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    recordSeller: async(req, res) => {        
        try{
            group = { type: "$qualifySeller" };
            console.log(req.query._id);
            let match = {user:ObjectId(req.query._id)};
            let sales = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);            
            res.status(200).json({status:1,data:sales,token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    listBuyer: async (req,res) => { 
        try{
            let count = await Buy.countDocuments({buyer:req.query._id,buyerComment:{$ne:null},sellerComment:{$ne:null}});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let buy = await Buy.find({buyer:req.query._id,buyerComment:{$ne:null}}).populate('buyer',{userName:1,photo:1,recordBuyer:1}).populate('product',{title:1,images:1}).skip(skip).limit(parseInt(req.query.limit)).sort({createdBuyer:-1});
            res.status(201).json({status:1,data:{buy,numPages},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    list: async (req,res) => { 
        try{
            console.log('fin');
            let count = await Buy.countDocuments({user:req.query._id,sellerComment:{$ne:null},buyerComment:{$ne:null}});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let buy = await Buy.find({user:req.query._id,sellerComment:{$ne:null}}).populate('buyer',{userName:1,photo:1,recordBuyer:1}).populate('product',{title:1,images:1}).skip(skip).limit(parseInt(req.query.limit)).sort({createdSeller:-1});
            res.status(201).json({status:1,data:{buy,numPages},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    listProduct: async (req,res) => {
        try{
            let count = await Buy.countDocuments({user:req.query._id,product:req.query.product,sellerComment:{$ne:null}});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let buy = await Buy.find({user:req.query._id,product:req.query.product,sellerComment:{$ne:null}}).populate('buyer',{userName:1,photo:1,recordBuyer:1}).populate('product',{title:1,images:1}).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(201).json({status:1,data:{buy,numPages},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    newComment: async (req, res) =>{
        try{
            if(req.type == 'img'){
                req.body.message == await Files.uploadImage(image);
            }
            let newComment = await Message(req.body);
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
    },
    meRecordBuyer: async (req, res) =>{
        try{
            console.log('cero',req.query.filter)
            group = { type: "$qualifyBuyer" };
            let match = {buyer:ObjectId(req.user._id)};
            let record = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            let count = 0;
            for (let i = 0; i < record.length; i++) {
                if(record[i]._id.type != 'none'){
                    count = count + record[i].count;
                }
            }
            let filter = {};
            filter.buyer = req.user._id;
            filter.buyerComment = {$ne:null};
            filter.sellerComment = {$ne:null}; 
            if(req.query.filter!=''){
                filter.qualifyBuyer = req.query.filter
            }

            let numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            
            let records = await Record.infoBuyer(ObjectId(req.user._id));
            let recordName = records.category;

            let messages = await Buy.find(filter,{messages:0}).populate('user',{userName:1,photo:1,record:1}).populate('product',{title:1,images:1}).skip(skip).limit(parseInt(req.query.limit)).sort({createdBuyer:-1});
            console.log('dos::>>',messages.length);
            res.status(200).json({status:1,data:{record,messages,numPages,recordName,records},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    meRecordUser: async (req, res) =>{
        try{
            group = { type: "$qualifySeller" };
            let match = {user:ObjectId(req.user._id)};
            let record = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            let count = 0;
            for (let i = 0; i < record.length; i++) {
                if(record[i]._id.type != 'none'){
                    count = count + record[i].count;
                }
            }
            let filter = {};
            filter.user = req.user._id;
            filter.sellerComment = {$ne:null};
            filter.buyerComment = {$ne:null};
            if(req.query.filter!=''){
                filter.qualifySeller = req.query.filter
            }
            let numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);

            //let recordName = await Record.calculate(req.user._id);
            let records = await Record.info(ObjectId(req.user._id));
            let recordName = records.category;

            let messages = await Buy.find(filter,{messages:0}).populate('buyer',{userName:1,photo:1,recordBuyer:1}).populate('product',{title:1,images:1}).skip(skip).limit(parseInt(req.query.limit)).sort({createdSeller:-1});
            res.status(200).json({status:1,data:{record,messages,numPages,recordName,records},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    availability: async (req, res) =>{
        try{
            group = { type: "$type" };
            let match = {user:ObjectId(req.user._id),status:1};
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
            let match = {user:ObjectId(req.user._id),type:'veco'};
            let money = await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            console.log(money);

            let entry = 0;
            let egress = 0;

            group = { type: "$type" };
            match = {user:ObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$gt:0},type:'referred'};
            let referred= await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            match = {user:ObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$lt:0},type:'referred'};
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

            let questionSales = await Question.countDocuments({user:ObjectId(req.user._id),status:1});
            let questionPurchase = await Question.countDocuments({client:ObjectId(req.user._id),status:1});

            let qualifyBuyer = await Buy.countDocuments({buyer:ObjectId(req.user._id),qualifySeller:'none'});
            let qualifySeller = await Buy.countDocuments({user:ObjectId(req.user._id),qualifyBuyer:'none'});

            let date2 = new Date();
            date2.setDate(date2.getDate() - 10);
            let noqualifyBuyer = await Buy.countDocuments({buyer:ObjectId(req.user._id),qualifySeller:'none',report:0,createdAt:{$lt:date2}});
            let noqualifySeller = await Buy.countDocuments({user:ObjectId(req.user._id),qualifyBuyer:'none',createdAt:{$lt:date2}});

            let record = await Record.info(ObjectId(req.user._id));
            let recordBuyer = await Record.infoBuyer(ObjectId(req.user._id))
            
            res.status(200).json({status:1,data:{money,sales,purchase,entry,egress,questionSales,questionPurchase,record,recordBuyer,qualifySeller,noqualifyBuyer,noqualifySeller,qualifyBuyer},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },    
    available: async (req, res) => {
        try {
            let group = { type: "$type",status:'$status' };
            let match = {user:ObjectId(req.user._id),type:'veco',$or:[{status:1},{status:2}]};
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
    },
    queryPayment: async (req, res) =>{
        try {
            req.query.user = req.user._id;
            let skip = req.query.skip;
            let limit = req.query.limit;
            delete req.query.skip;
            delete req.query.limit;
            if(req.query.max){
                req.query.amount = {$lt:req.query.max};
                delete req.query.max
            }
            if(req.query.min){
                req.query.amount = {$gt:req.query.min};
                delete req.query.min
            }
            if(req.query.status){
                let status = req.query.status.split(',');
                req.query.$or = []
                for (let i = 0; i < status.length; i++) {                    
                    req.query.$or.push({status:status[i]})
                }
                delete req.query.status;
            }
            console.log(req.query)
            let payment = await Payment.find(req.query).populate('buy').populate('product').sort({$natural:-1});
            res.status(200).json({status:1,data:{payment},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },    
    withdrawals: async (req, res) =>{
        try {
            let group = { type: "$type",status:'$status' };
            let match = {user:ObjectId(req.user._id),type:'veco',$or:[{status:1},{status:2}]};
            let money = await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            let amount = 0;
            for (let i = 0; i < money.length; i++) {
                amount += money[i].count;                
            }

            let payment = new Payment({
                user:req.user._id,
                account: req.body.account,
                amount:parseInt(req.body.amount)*-1,
                type:'veco'
            })

            await payment.save();

            res.status(200).json({status:1,data:true,token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    listWithdrawals2: async (req, res) =>{
        try {
            let payment = await Payment.find({user:req.user._id,type:'veco',amount:{$lt:0},$or:[ { status:1 }, { status:2 } ]}).sort({$natural:-1}).populate('account').populate('product');
            
            let banks = await Bank.find({},{name:1});
           

            res.status(200).json({status:1,data:{payment,banks},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    pendingPayments: async (req, res) =>{
        try {
            let payment = await Payment.find({type:'veco',buy:null, status:2 }).populate('account').populate('product').populate('user');
            let banks = await Bank.find({},{name:1,logo:1});
            res.status(200).json({status:1,data:{payment,banks},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    pendingExecuted: async (req, res) =>{
        try {
            let count = await Payment.countDocuments({type:'veco',buy:null, status:1 });
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let payment = await Payment.find({type:'veco',buy:null, status:1 }).populate('account').populate('product').populate('user').skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(200).json({status:1,data:{payment,numPages},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    processPayments: async (req, res) =>{
        try {
            let image = await Files.uploadImage(req.body.photo);
            let payment = await Payment.findByIdAndUpdate(req.body._id,{ photo:image, status: 1 }, {fields:userData,new: true });
            res.status(200).json({status:1, data: { payment }, token: req.token });
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    search: async(req, res) =>{
        try {
            let filter ={
                $or:[{
                    buyerName: { "$regex" : req.query.search, "$options" : "-i" },
                },{
                    number: { "$regex" : req.query.search, "$options" : "-i" },
                }],
                user: req.user._id
            }
            let buy = await Buy.find(filter).populate('messages').populate('product',productData).populate('buyer',userData).populate('user',userData); 
            res.status(200).json({status:1,data:{buy}});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    gainQuantity: async(req, res) =>{
        try {
            let date = new Date();            
            switch(req.query.date){
                case 'day':
                    date.setDate(date.getDate() - 1);
                break;
                case 'week':
                    date.setDate(date.getDate() - 7);
                break;
                case 'fortnight':
                    date.setDate(date.getDate() - 15);
                break;
                case 'monthly':
                    date.setDate(date.getDate() - 30);
                break;
            }

            let buy = await Buy.find({ $or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date} }).populate('product');
            res.status(200).json({ status:1, data: { buy } });
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    allGain: async(req, res) =>{
        try {
            let date = new Date();            
            switch(req.query.date){
                case 'day':
                    date.setDate(date.getDate() - 1);
                break;
                case 'week':
                    date.setDate(date.getDate() - 7);
                break;
                case 'fortnight':
                    date.setDate(date.getDate() - 15);
                break;
                case 'monthly':
                    date.setDate(date.getDate() - 30);
                break;
            }
            group = { type: "$status" };
            let match = { $or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date} };
            let buy = await Buy.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            let user = {};
            user.total = await User.countDocuments({$or:[ { status:1 }, { status:2 } ]});
            user.date = await User.countDocuments({$or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date}});
            
            group = { city: "$city" };
            match = { $or:[ { status:1 }, { status:2 } ] };
            let userCity = await User.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);

            group = { city: "$cityBuyer" };
            match = { $or:[ { status:1 }, { status:2 } ], createdAt:{ $gt:date } };
            let buyCity = await Buy.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            
            res.status(200).json({ status:1, data: { buy, user, userCity, buyCity } });
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    reportYear: async (req, res) =>{
        try{
            let date = new Date();
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMonth(date.getMonth() - 11);
            let group = { month: "$month"};
            let match = { $or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date} };
            let buy = await Buy.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            let months = []
            let month = new Date().getMonth();
            let monthArray = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
            for (let i = 0; i < 12; i++) {
                let count = 0;
                let total = 0
                for (let e = 0; e < buy.length; e++) {
                    if(buy[e]._id.month == month){
                        count = buy[e].count;
                        total = buy[e].total;
                    }                    
                }
                months.push({
                    month:monthArray[month],
                    count:count,
                    total:total
                })             
                --month;
                if(month<0){
                    month = 11
                }
            }
            res.status(201).json({status:1,data:{buy:months},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    noqualifySeller: async (req,res) => { 
        try{
            console.log('fin');
            let buy= await Buy.find({user:req.user._id,qualifyBuyer:'none'}).populate('messages').populate('product',productData).populate('buyer',userData).populate('user',userData).sort({$natural:-1});
            res.status(201).json({status:1,data:{buy},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    noqualifyBuyer: async (req,res) => { 
        try{
            console.log('fin');
            let buy= await Buy.find({buyer:req.user._id,qualifySeller:'none'}).populate('messages').populate('product',productData).populate('buyer',userData).populate('user',userData).sort({$natural:-1});
            res.status(201).json({status:1,data:{buy},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    lock: async (req, res) =>{
        try{
            let date = new Date();
            date.setDate(date.getDate() - 15);
            console.log(date)
            let noqualifyBuyer = await Buy.countDocuments({buyer:ObjectId(req.user._id),qualifySeller:'none',report:0,createdAt:{$lt:date}});
            let noqualifySeller = await Buy.countDocuments({user:ObjectId(req.user._id),qualifyBuyer:'none',createdAt:{$lt:date}});

            res.status(201).json({status:1,data:{noqualifyBuyer,noqualifySeller},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    lockList: async (req, res) =>{
        try{
            let date = new Date();
            date.setDate(date.getDate() - 15);
            let buyer = await Buy.find({buyer:req.user._id,qualifySeller:'none',report:0,createdAt:{$lt:date}}).populate('product',productData).populate('buyer',userData);;
            let seller = await Buy.find({user:req.user._id,qualifyBuyer:'none',createdAt:{$lt:date}}).populate('product',productData).populate('user',userData);;

            res.status(201).json({status:1,data:{buyer,seller},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    report: async (req, res) =>{
        try{
            let buy = await Buy.findByIdAndUpdate(req.body._id,{report:1,reportComment:req.body.comment})
            res.status(201).json({status:1,data:{buy},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    reportList: async (req, res) =>{
        try{
            let date = new Date();            
            switch(req.query.date){
                case 'day':
                    date.setDate(date.getDate() - 1);
                break;
                case 'week':
                    date.setDate(date.getDate() - 7);
                break;
                case 'fortnight':
                    date.setDate(date.getDate() - 15);
                break;
                case 'monthly':
                    date.setDate(date.getDate() - 30);
                break;
            }
            console.log('si')
            group = { type: "$report" };
            let match = { $or:[ { report:1 }, { report:2 } ],createdAt:{$gt:date} };
            let reports = await Buy.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            res.status(201).json({status:1,data:{reports},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },

    listWithdrawals: async (req, res) =>{
        try {
            let date = new Date();
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMonth(date.getMonth() - 11);

            let payment = await Payment.find({user:req.user._id,type:'veco',amount:{$lt:0},$or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date}}).sort({$natural:-1}).populate('account').populate('product');
            
            let banks = await Bank.find({},{name:1,logo:1});           

            res.status(200).json({status:1,data:{payment,banks},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },

    
    paymentYear: async (req, res) =>{
        try{
            let date = new Date();
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMonth(date.setMonth() - 11);
            let group = { month: "$month"};
            let match = { $or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date} };
            let buy = await Buy.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            let months = []
            let month = new Date().getMonth();
            let monthArray = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
            for (let i = 0; i < 12; i++) {
                let count = 0;
                let total = 0
                for (let e = 0; e < buy.length; e++) {
                    if(buy[e]._id.month == month){
                        count = buy[e].count;
                        total = buy[e].total;
                    }                    
                }
                months.push({
                    month:monthArray[month],
                    count:count,
                    total:total
                })             
                --month;
                if(month<0){
                    month = 11
                }
            }
            res.status(201).json({status:1,data:{buy:months},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
}