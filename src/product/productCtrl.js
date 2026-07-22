let Product = require('./productSchema');
let Buy = require('../buy/buySchema');
let Files = require('../file/fileCtrl');
let Category = require('../category/categorySchema');
let Question = require('../question/questionSchema');
let User = require('../user/userSchema');
let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Location = require('../data/locations');
let Record = require('./record');
let Payment = require('../buy/paymentSchema');
let Increment = require('./incrementShema');
let Authorized = require('./authorizedSchema');

let productData = {title:1,images:1,price:1, quantitySold:1,city:1,department:1,favorite:1,visits:1,status:1,number:1};
let categoryData = {createdAt:0,status:0,__v:0, subcategory:0};
let userData = {password:0,passwordFailures:0,status:0,__v:0};
let productData2 = {createdAt:0,status:0,__v:0};

async function counts(id,filter) {
    return 0;
}
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
            let images = req.body.images;
            delete req.body.images;
            req.body.user = req.user._id;
            req.body.city = req.user.city;
            req.body.department = req.user.department;
            req.body.month = new Date().getMonth();
            req.body.year = new Date().getFullYear();
            let newProduct = new Product(req.body);
            let product = await newProduct.save();
            let response = await Files.uploadImages(images);
            if(response.length>0){
                product = await Product.findByIdAndUpdate(product._id,{images:response},{new: true });
                res.status(201).json({status:1,data:product,token:req.token});
            }else{
                res.status(500).json({status:0, data:['Ha ocurrido un error']})
            }
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    edit: async (req,res) => {
        try{
            let imagesDelete = req.body.imagesDelete;
            if(req.body.imagesNew.length>0){
                let response = await Files.uploadImages(req.body.imagesNew);
                    req.body.images =response ;
            }            
            delete req.body.imagesNew;
            delete req.body.imagesDelete;
            let product = await Product.findByIdAndUpdate(req.body._id,req.body,{new: true });
            //product = await Product.findByIdAndUpdate(product._id,{$pullAll:{images:imagesDelete}},{new: true });
            res.status(201).json({status:1,data:product,token:req.token});
            
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },    
    pause: async (req,res) => {
        try{
            let product = await Product.findByIdAndUpdate(req.body._id,{status:2},{new: true });
            res.status(200).json({status:1,data:{product},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },    
    start: async (req,res) => {
        try{
            let product = await Product.findById(req.body._id);
            if(product.quantity > 0){
                product = await Product.findByIdAndUpdate(req.body._id,{status:1},{new: true });
                res.status(200).json({status:1,data:{product},token:req.token});
            }else{
                res.status(200).json({status:0,data:['No hay inventario disponible'],token:req.token});
            }
            
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    me: async (req,res) => {
        try{
            let group = { status:'$status' };
            let match = {user:ObjectId(req.user._id)};
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
            let record = await Record.calculate(product.user._id);
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
                let record = await Record.calculate(product.user._id);
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
            let record = await Record.calculate(product.user._id);
            let group = { type: "$type" };
            let match = {user:ObjectId(req.user._id),$or:[{status:1},{status:2}]};
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
    },
    category: async (req,res) => {
        try{
            let category = await Category.findById(req.query._id);

            let count = await Product.countDocuments({category:{$in:category.subcategory}});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)

            let product = await Product.find({category:{$in:category.subcategory}},productData).populate('user',{city:1,department:1}).skip(skip).limit(parseInt(req.query.limit));
            res.status(200).json({status:1,data:{product,numPages},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    subcategory: async (req,res) => {
        try{
            let count = await Product.countDocuments({category:req.query._id});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)

            let product = await Product.find({category:req.query._id},productData).populate('user',{city:1,department:1}).skip(skip).limit(parseInt(req.query.limit));
            res.status(200).json({status:1,data:{product,numPages},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    filter: async (req, res) => {
        try{
            let filter = {status:1};
            let match = {status:1};
            let match2 = {status:1};
            let match3 = {status:1};
            let group = { category: "$category" };
            let group2  = { department: "$department" };
            let group3  = {};
            if(req.query.category){
                group = { subcategory: "$subcategory" };
                match.category = ObjectId(req.query.category);
                if(req.query.subcategory){
                    filter.subcategory = req.query.subcategory;
                    match2.subcategory = ObjectId(req.query.subcategory);
                    match3.subcategory = ObjectId(req.query.subcategory);
                }else{
                    match2.category = ObjectId(req.query.category);
                    match3.category = ObjectId(req.query.category);
                    filter.category = req.query.category;
                }
            }
            if(req.query.department){
                group2 = { city: "$city" };
                match2.department = req.query.department;
                if(req.query.city){
                    filter.city = req.query.city;
                    match.city = req.query.city;
                    match3.city = req.query.city;
                }else{
                    filter.department = req.query.department;
                    match.department = req.query.department;
                    match3.department = req.query.department;
                }
            }
            group3 = { condition: "$condition" };
            if(req.query.condition){
                filter.condition = req.query.condition;
                match.condition = req.query.condition;
                match2.condition = req.query.condition; 
            }

            if(req.query.min&&req.query.max){
                filter.price ={$gt:parseInt(req.query.min),$lt:parseInt(req.query.max)};
                match.price ={$gt:parseInt(req.query.min),$lt:parseInt(req.query.max)};
                match2.price ={$gt:parseInt(req.query.min),$lt:parseInt(req.query.max)};
                match3.price ={$gt:parseInt(req.query.min),$lt:parseInt(req.query.max)};
            }

            if(req.query.search){
                filter.$text = { $search : req.query.search}
                match.$text = { $search : req.query.search}
                match2.$text = { $search : req.query.search}
                match3.$text = { $search : req.query.search}
            }            
            /*if(req.query.user){
                let user = await User.findById(req.query.user,{complaints:1});
                filter.user = {$ne:user.complaints};
                let complaints=[ObjectId('5ee8fb5e0464343940b6f7a3')];
                user.complaints.forEach(user => {
                    complaints.push(ObjectId(user))
                });                
                console.log(complaints);
                match.user = {$ne:complaints[0]};
                match2.user = {$ne:complaints[0]};
                match3.user = {$ne:complaints[0]};
            }*/

            let count = await Product.countDocuments(filter);
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            
            let filterCategory = await Product.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]); 
            let filterLocation = await Product.aggregate([
                { $match : match2 },
                { $group: { _id: group2, count: { $sum: 1 } } }
            ]);
            let filterCondition= await Product.aggregate([
                { $match : match3 },
                { $group: { _id: group3, count: { $sum: 1 } } }
            ]);

            let categoryFilter = [];
            let category;
            if(req.query.category){
                category = await Category.findById(req.query.category,{name:1}).populate('subcategory',{name:1});
                    let cate = { _id:category._id, name: category.name, subcategory: [] }
                    for (let i = 0; i < category.subcategory.length; i++) {
                        let subcate = { _id: category.subcategory[i]._id, name: category.subcategory[i].name, count: 0 }
                        for (let e = 0; e < filterCategory.length; e++) {
                            if(subcate._id.toString() == filterCategory[e]._id.subcategory.toString()){
                                subcate.count = filterCategory[e].count;
                            }   
                        }
                        cate.subcategory.push(subcate);               
                    }
                    categoryFilter.push(cate); 
            }else{
                category = await Category.find({father:1},{name:1});
                for (let i = 0; i < category.length; i++) {
                    let subcate = { _id: category[i]._id, name: category[i].name, count: 0, subcategory: [] }
                    for (let e = 0; e < filterCategory.length; e++) {
                        if(subcate._id.toString() == filterCategory[e]._id.category.toString()){
                            subcate.count = filterCategory[e].count;
                        }   
                    }
                    categoryFilter.push(subcate);            
                }
            }

            let locationFilter = [];
            let location;
            if(req.query.department){
                location = Location[req.query.department];
                let loca = { name: req.query.department, city: [] }
                for (let i = 0; i < location.length; i++) {
                    let city = { name: location[i], count: 0 }
                    for (let e = 0; e < filterLocation.length; e++) {
                        if(city.name == filterLocation[e]._id.city){
                            city.count = filterLocation[e].count;
                        }   
                    }
                    loca.city.push(city);               
                }
                locationFilter.push(loca); 
            }else{
                location = Location.Department;
                for (let i = 0; i < location.length; i++) {
                    let subloca = { name: location[i], count: 0, city: [] }
                    for (let e = 0; e < filterLocation.length; e++) {
                        if(subloca.name == filterLocation[e]._id.department){
                            subloca.count = filterLocation[e].count;
                        }
                    }
                    locationFilter.push(subloca);            
                }
            }
            let conditionFilter = [];
            conditionFilter.push({name:'Nuevo',subname:'new',count:0});
            conditionFilter.push({name:'Usado',subname:'used',count:0})
            for (let i = 0; i < filterCondition.length; i++) {
                if(filterCondition[i]._id.condition=='new'){
                    conditionFilter[0].count=filterCondition[i].count;
                }else{
                    conditionFilter[1].count=filterCondition[i].count;
                }           
            }
            console.log(filterCondition)

            let product = await Product.find(filter,productData).populate('user',{city:1,department:1}).skip(0).limit(parseInt(req.query.limit));
            res.status(200).json({status:1,data:{product,numPages,categoryFilter,locationFilter,conditionFilter},token:req.token});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    search: async (req, res) => {
        try{
            let filter = {status:1};
            if(req.query.category){
                if(req.query.subcategory){
                    filter.subcategory = req.query.subcategory;
                }else{
                    filter.category = req.query.category;
                }
            }
            if(req.query.department){
                if(req.query.city){
                    filter.city = req.query.city;
                }else{
                    filter.department = req.query.department;
                }
            }
            if(req.query.condition){
                filter.condition = req.query.condition;
            }

            if(req.query.min&&req.query.max){
                filter.price ={$gt:parseInt(req.query.min),$lt:parseInt(req.query.max)};
            }

            if(req.query.search){
                filter={ $text : { $search : req.query.search}}
            }

            let count = await Product.countDocuments(filter);
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            
            let product = await Product.find(filter,productData).populate('user',{city:1,department:1}).skip(skip).limit(parseInt(req.query.limit));
            res.status(200).json({status:1,data:{product,numPages}});
        }catch(err){
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    keywords: async (req, res) =>{
        try {
            //let filter={ $text : { $search : req.query.keywords}}
            let filter ={
                title: { "$regex" : req.query.keywords, "$options" : "-i" }
            }
            let product = await Product.find(filter,{title:1}).limit(10);
            res.status(200).json({status:1,data:product});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    favoriteAdd: async (req, res) =>{
        try {
            //let product = req.query._id.toLowerCase();
            let product = await Product.update({_id:req.body._id},{$addToSet: {
                favorite: req.user._id
            }},{multi:true});
            res.status(200).json({status:1,data:product});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    favoriteRemove: async (req, res) =>{
        try {
            console.log(req.user._id);
            let product = await Product.update({_id:req.query._id},{$pull: {
                favorite: req.user._id
            }},{multi:true});
            res.status(200).json({status:1,data:product});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    favorite: async (req, res) =>{
        try {
            let count = await Product.countDocuments({favorite:req.user._id});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)
            let product = await Product.find({favorite:req.user._id},productData).populate('user',{city:1,department:1}).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(200).json({status:1,data:{product,numPages},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    operations: async (req, res) =>{
        try {
            let date = new Date();
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMonth(date.setMonth() - 11);
            let group = { month: "$month", type: "$highlight"};
            let match = { createdAt:{$gt:date},$or:[ { status:1 }, { status:2 } ] };
            let product = await Product.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 }} }
            ]);

            let group2 = { month: "$month"};
            let match2 = { createdAt:{$gt:date},status:1 };
            let product2 = await Product.aggregate([ 
                { $match : match2 },
                { $group: { _id: group2, count: { $sum: 1 }} }
            ]);

            let months = []
            let month = new Date().getMonth();
            let monthArray = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
            for (let i = 0; i < 12; i++) {
                let normal = 0;
                let highlight = 0;
                let active = 0;
                for (let e = 0; e < product.length; e++) {
                    if(product[e]._id.month == month && product[e]._id.type =='normal'){
                        normal = product[e].count;
                    }                    
                }
                for (let e = 0; e < product.length; e++) {
                    if(product[e]._id.month == month && product[e]._id.type =='highlight'){
                        highlight = product[e].count;
                    }                    
                }
                for (let e = 0; e < product2.length; e++) {
                    if(product2[e]._id.month == month ){
                        active = product2[e].count;
                    }                    
                }
                months.push({
                    month:monthArray[month],
                    normal:normal,
                    highlight:highlight,
                    active:active
                })             
                --month;
                if(month<0){
                    month = 11
                }
            }
            res.status(201).json({status:1,data:{product:months},token:req.token});
        } catch (err) {
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    outstanding: async (req, res) =>{
        try {
            let count = await Product.countDocuments({status:1,highlight:'highlight'});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)
            let product = await Product.find({status:1,highlight:'highlight'},{title:1,images:1,price:1,favorite:1,city:1,department:1}).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(200).json({status:1,data:{product,numPages},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    last: async (req, res) =>{
        try {
            let count = await Product.countDocuments({status:1});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)
            let product = await Product.find({status:1},{title:1,images:1,price:1,favorite:1,city:1,department:1}).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(200).json({status:1,data:{product,numPages},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    sold: async (req, res) =>{
        try {
            let count = await Product.countDocuments({status:1,quantitySold:{$gt:0}});
            numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit)
            let product = await Product.find({status:1,quantitySold:{$gt:0}},{title:1,images:1,price:1,favorite:1,city:1,department:1,quantitySold:1}).skip(skip).limit(parseInt(req.query.limit)).sort({quantitySold:-1});
            res.status(200).json({status:1,data:{product,numPages},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
}