const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');
const Payment = require('../../../infrastructure/mongoose/repositories/PaymentRepository');
const Increment = require('../../../infrastructure/mongoose/repositories/BuyIncrementRepository');
const Relations = require('../../../infrastructure/gateways/BuyRelationsGateway');
const Product = Relations.Product;
const Authorized = Relations.Authorized;

// TODO(v2): preservar los bugs conocidos hasta una fase funcional.
module.exports = {
    createIncrement:async (req, res) =>{
        let increment = Increment.create();
        increment = await increment.save();
        res.status(201).json({status:1,data:increment});
    },
    new: async (req,res) => {
        try{
            let increment = await Increment.findOneAndUpdate({status:1},{$inc: {number: 1 } },{new: true });
            req.body.number = increment.number;
            req.body.month = new Date().getMonth();
            req.body.year = new Date().getFullYear();
            let newBuy = Buy.create(req.body);            
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
                let payment = Payment.create({type:'veco',amount:vecoSellerCash,user:buy.user,buy:buy._id,product:buy.product,status:4,createdAt:new Date()})
                await payment.save();
            }
            if(vecoSeller!=0){
                let payment = Payment.create({type:'veco',amount:vecoSeller,user:buy.user,buy:buy._id,product:buy.product,status:3,createdAt:new Date()})
                await payment.save();
            }
            if(vecoBuyer!=0){
                let payment = Payment.create({type:'veco',amount:vecoBuyer,user:buy.buyer,buy:buy._id,product:buy.product,createdAt:new Date()})
                await payment.save();
            }
            if(referredBuyer!=0){
                let payment = Payment.create({type:'referred',amount:referredBuyer,user:buy.buyer,product:buy.product,buy:buy._id,createdAt:new Date()})
                await payment.save();
            }


            let productQuantity =await Product.findByIdAndUpdate(buy.product, {$inc: {quantity: (buy.quantity*-1)}},{new:true});
            if(productQuantity.quantity == 0){
                await Product.findByIdAndUpdate(buy.product,{status:2})
            }
            await Product.findByIdAndUpdate(buy.product, {$inc: {quantitySold: buy.quantity}});
            console.log('New',req.body.dataSend)
            if(req.body.dataSend == 'new'){
                let authorized = Authorized.create({
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
    }
};
