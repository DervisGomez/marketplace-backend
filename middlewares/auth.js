let serviceToken = require('../services/token');

module.exports = async (req,res,next) => {
    if(!req.headers.authorization || !req.headers._id) return res.status(403).send({status:0,data:['Requiere Token']});
    const token = req.headers.authorization;
    let response = await serviceToken.decode(token);
    if(response.status==200 && req.headers._id == response.user._id){
        req.user=response.user;
        if(response.token){
            req.token=response.token; 
        }
        next();
    }else{
        res.status(403).json({status:0,data:['Token invalido']});
    }
}