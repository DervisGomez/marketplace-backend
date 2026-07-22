const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');
const User = require('../../../infrastructure/gateways/BuyRelationsGateway').User;

// TODO(v2): preservar los bugs conocidos hasta una fase funcional.
module.exports = {
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
    }
};
