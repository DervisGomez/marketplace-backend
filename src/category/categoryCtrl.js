let Category = require('./categorySchema');
let Product = require('../product/productSchema');
const categories = require('./categoryList');
const { findById } = require('./categorySchema');
let Record = require('../product/record'); 
let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    load: async (req,res) => {
        try{
            await Product.remove();
            await Category.remove();
            console.log(categories);
            await categories.forEach(async category => {
                let newCategory = new Category ({
                    name:category.name,
                    father:1
                });
                let categoryNew = await newCategory.save();
                await category.subcategory.forEach(async subcategory => {
                    let newSubcategory = new Category ({
                        name:subcategory,
                        categoryFather:categoryNew._id
                    });
                    let subcategoryNew = await newSubcategory.save();
                    await Category.findByIdAndUpdate(categoryNew._id,{$addToSet: {
                        subcategory:subcategoryNew._id
                    }},{multi:true});
                });                
            });
            res.status(201).json({status:1,data:categories});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    list:async (req,res) => {
        try{
            let category = await Category.find({father:1},{createdAt:0,status:0,__v:0}).populate('subcategory',{subcategory:0,createdAt:0,status:0,__v:0});
            res.status(201).json({status:1,data:category});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    listProduct:async (req,res) => {
        try{
            let category = await Category.find({father:1},{createdAt:0,status:0,__v:0}).populate('subcategory',{subcategory:0,createdAt:0,status:0,__v:0});
            let record = await Record.calculate(ObjectId(req.user._id));
            res.status(201).json({status:1,data:{category,record}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    listHome:async (req,res) => {
        try{
            let category = await Category.find({father:1},{createdAt:0,status:0,__v:0}).populate('subcategory',{subcategory:0,createdAt:0,status:0,__v:0});
            let product = await Product.find({status:1},{title:1,images:1,price:1,favorite:1,city:1,department:1}).sort({$natural:-1}).limit(8);
            let productQuantity = await Product.find({status:1,quantitySold:{$gt:0}},{title:1,images:1,price:1,favorite:1,city:1,department:1,quantitySold:1}).sort({quantitySold:-1}).limit(8);
            let productHighlight = await Product.find({status:1,highlight:'highlight'},{title:1,images:1,price:1,favorite:1,city:1,department:1,highlight:1}).sort({$natural:-1}).limit(16);
            res.status(201).json({status:1,data:{category,product,productQuantity,productHighlight}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    add:async (req,res) => {
        try{
            let newCategory = new Category(req.body);
            newCategory.subcategory = [];
            newCategory.father = 1;
            let category = await newCategory.save();
            res.status(201).json({status:1,data:{category}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    addSub:async (req,res) => {
        try{
            let newCategory = new Category(req.body);
            newCategory.subcategory = [];
            newCategory.father = 0;
            let subcategory = await newCategory.save();
            let category = await Category.findByIdAndUpdate(req.body.category,{$addToSet: {
                subcategory: subcategory._id
            }},{multi:true})
            res.status(201).json({status:1,data:{subcategory}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    edit:async (req,res) => {
        try{
            let category = await Category.findByIdAndUpdate(req.body._id,req.body,{new: true });
            res.status(201).json({status:1,data:{category}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    editSub:async (req,res) => {
        try{
            let category = await Category.findByIdAndUpdate(req.body._id,req.body,{new: true });
            res.status(201).json({status:1,data:{category}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    remove:async (req,res) => {
        try{
            let category = await Category.remove({_id:req.query._id});
            res.status(201).json({status:1,data:{category}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    removeSub:async (req,res) => {
        try{
            let subcategory = await Category.remove({_id:req.query._id});
            let category = await Category.findByIdAndUpdate(req.body.category,{$addToSet: {
                subcategory: req.query._id
            }},{multi:true})
            res.status(201).json({status:1,data:{subcategory}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
}