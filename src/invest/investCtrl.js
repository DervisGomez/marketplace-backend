let Invest = require('./investSchema');
let mongoose = require('mongoose');
let Files = require('../file/fileCtrl');

module.exports = {
    add:async (req,res) => {
        try{
            let newInvest = new Invest(req.body);
            let invest = await newInvest.save();
            res.status(201).json({status:1,data:{invest}});
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
}