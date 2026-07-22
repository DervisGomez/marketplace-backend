const Payment = require('../../../infrastructure/mongoose/repositories/PaymentRepository');

// TODO(v2): preservar bugs y contratos del flujo Payment legacy.
module.exports = {
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
    }
};
