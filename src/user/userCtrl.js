let User = require('./userSchema');
let UserTemp = require('./userTempSchema');
let Code = require('./codeSchema');
let RandString = require('../../services/randString');
let Message = require('../../services/message');
let Token = require('../../services/token');
let bcrypt = require('bcryptjs');
let Validate = require('../../services/validate');
let fs = require('fs');
let Files = require('../file/fileCtrl');
let Product = require('../product/productSchema');
let EmailService = require('../../services/email');
let Payment = require('../buy/paymentSchema');
let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
let Buy = require('../buy/buySchema');
let Increment = require('./incrementShema');

let userData = {password:0,passwordFailures:0,__v:0}

async function validateErr (res,err) {
    console.log(err);
    let errors = await Validate.required(err);
    if(errors.length>0){
        res.status(500).json({status:0,data:errors});
    }else{
        res.status(500).json({status:0,data:['Ha ocurrido un erro en el servidor']});
    }
    
}
module.exports = {
    createIncrement:async (req, res) =>{
        let increment = new Increment();
        increment = await increment.save();
        let user = await User.find();
        for (let i = 0; i < user.length; i++) {
            increment = await Increment.findOneAndUpdate({status:1},{$inc: {number: 1 } },{new: true })
            await User.findByIdAndUpdate(user[i]._id,{number:increment.number})          
        }
        res.status(201).json({status:1,data:increment});
    },
    linkInvitation: async (req,res) => {
        try{
            let user = await User.findOne({linkInvitation:req.query.linkInvitation});
            if(user){
                res.status(200).json({status:1,data:user._id});
            }else{
                res.status(500).json({status:0, data:['Link de invitación invalido']})
            }
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    codeRegister: async (req,res,next) => {
        try{
            let user = await User.findOne({$or:[{userName:req.body.userName},{phone:req.body.phone},{email:req.body.email},{identification:req.body.identification}]});
            if(!user){
                /*var regex = new RegExp(/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/);
                var rex = regex.test(req.body.password);
                console.log(rex);*/
                console.log(req.body);
                let date = req.body.birthdate.split('-')
                req.body.month = parseInt(date[1]);
                req.body.day = parseInt(date[2]);
                if(req.body.password.length>7&&req.body.password.length<17){
                    await UserTemp.deleteOne({$or:[{phone:req.body.phone},{email:req.body.email},{identification:req.body.identification}]});
                    req.body.codeRegister = RandString.create(7);
                    console.log(req.body.codeRegister);                
                    req.body.password = await bcrypt.hash(req.body.password,global.config.token.bcrypt_salt_rounds);
                    let newUserTemp = new UserTemp(req.body);
                    let userTemp = await newUserTemp.save();
                    let code = await Message.sendMessage('Bienvenido a nuestra plataforma de compra y venta tu codigo de registro es: '+req.body.codeRegister,req.body.phone);            
                    if(code){
                        res.status(201).json({status:1,data:userTemp._id});
                    }else{
                        res.status(500).json({status:0,data:['Numero de teléfono invalido']});
                    }                    
                }else{
                    res.status(500).json({status:0,data:['Debe tener entre 8 y 16 caracteres.']});
                }
            }else{
                if(user.phone==req.body.phone){
                    res.status(500).json({status:0,data:['Numero de telefono ya esta siendo usado por otro usuario']});
                } else if(user.email==req.body.email){
                    res.status(500).json({status:0,data:['Correo ya esta siendo usado por otro usuario']});
                } else if(user.userName==req.body.userName){
                    res.status(500).json({status:0,data:['Usuario ya esta siendo usado por otro usuario']});
                } else{
                    res.status(500).json({status:0,data:['Cédula ya registrada']});
                }               
            }
        }catch(err){
            validateErr(res,err);
        }
    },
    resendCode: async (req,res) => {
        try{
            let codeRegister = RandString.create(7);
            let userTemp = await UserTemp.findByIdAndUpdate(req.body._id,{codeRegister:codeRegister},{new:true});
            await Message.sendMessage('Bienvenido a nuestra plataforma de compra y venta tu codigo de registro es: '+userTemp.codeRegister,userTemp.phone);
            res.status(201).json({status:1,data:userTemp._id});
        }catch(err){
            let errors = await Validate.required(err);
            res.status(500).json({status:0,data:errors});
        }
    },
    register: async (req,res,next) => {
        try{
            let userTemp = await UserTemp.findById(req.body._id);
            if(userTemp.codeRegister==req.body.codeRegister.toLowerCase()){
                let increment = await Increment.findOneAndUpdate({status:1},{$inc: {number: 1 } },{new: true })
                let newUser = new User({
                    name:userTemp.name,
                    lastName:userTemp.lastName,
                    userName:userTemp.userName,
                    password:userTemp.password,
                    phone:userTemp.phone,
                    linkInvitation:userTemp.name.toLowerCase()+'/'+RandString.create(7),
                    identification: userTemp.identification,
                    email: userTemp.email,
                    department: userTemp.department,
                    city: userTemp.city,
                    birthdate: userTemp.birthdate,
                    month: userTemp.month,
                    day: userTemp.day,
                    number: increment.number
                });
                if(userTemp.referred){
                    newUser.referred=userTemp.referred
                }
                let user = await newUser.save();
                user = await User.findById(user._id,userData);
                let token= await Token.encode(user,global.config.token.days);
                res.status(201).json({status:1,data:user,token:token});
            }else{
                res.status(500).json({status:0,data:['Código incorrecto']});
            }
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    login: async(req, res) =>{
        try{ 
            let user = await User.findOne({$or:[{phone:req.body.userName},{userName:req.body.userName},{email:req.body.userName}]});
            if(user!=null){
                if(user.passwordFailures<3){
                    let match = await bcrypt.compare(req.body.password,user.password);
                    if(match){
                        user = await User.findByIdAndUpdate(user._id,{passwordFailures:0}, {fields:userData,new: true });
                        let token= await Token.encode(user,global.config.token.days); 
                        console.log(user);
                        res.status(200).json({status:1,data:user,token:token});
                    }else{
                        user = await User.findByIdAndUpdate(user._id,{passwordFailures:user.passwordFailures+1},{new: true })
                        if(user.passwordFailures==5){
                            res.status(500).json({status:0, data:['Usuario bloqueado']})
                        }else{
                            res.status(500).json({status:0, data:['Contraseña Invalido']})
                        }                        
                    }
                }else{
                    res.status(500).json({status:0, data:['Usuario bloqueado']})
                }
            }else{
                res.status(500).json({status:0, data:['Usuario o teléfono Invalido']})
            }
        }catch(err){
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    recoverPasswordPhone: async(req, res) => {
        try {
            let user = await User.findOne({phone:req.body.phone});
            if(user){
                await Code.deleteOne({medium:user.phone});
                let codeSend = RandString.create(8);
                console.log(codeSend);
                let newCode = new Code({medium:user.phone,code:codeSend});
                let code = await newCode.save();
                await Message.sendMessage('Tu codigo de recuperación es: '+codeSend,user.phone);
                res.status(200).json({status:1,data:code.id});
            }else{
                res.status(500).json({status:0,data:['Celular no registrado']});
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }        
    },
    recoverPasswordEmail: async(req, res) => {
        try {
            let user = await User.findOne({email:req.body.email});
            if(user){
                await Code.deleteOne({medium:user.email});
                let codeSend = RandString.create(8);
                let newCode = new Code({medium:user.email,code:codeSend});
                let code = await newCode.save();
                //await Message.sendMessage('Tu codigo de recuperación es: '+codeSend,user.phone);
                let token= await Token.encode(code,global.config.token.days); 
                let body = `
                <p>Hola ${user.name}, para recuperar la contraseña haz click en el botón de abajo</p>
                <a href="${global.config.url.web+'password/'+token}" target="_blank">Nueva contraseña</a>
                <p>Equipo de MLOLX</p>`
                const result=await EmailService.send(req.body.email,'MLOLX','Recuperar contraseña',body);
                console.log(result);
                if(result.status==1){    	    		
                    res.status(200).json({status:1,data:code.id});
                }else{
                    res.status(500).json({status:0,data:['Correo no valido']});
                }
            }else{
                res.status(500).json({status:0,data:['Celular no registrado']});
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }        
    },
    codeResendPhone: async (req,res) => {
        try{
            let code = RandString.create(7);
            let codeTemp = await Code.findByIdAndUpdate(req.body._id,{code:code},{new:true});
            console.log(code);
            await Message.sendMessage('Tu codigo de recuperación es: '+codeTemp.code,codeTemp.medium);
            res.status(201).json({status:1,data:codeTemp._id});
        }catch(err){
            let errors = await Validate.required(err);
            res.status(500).json({status:0,data:errors});
        }
    },
    recoveryCodePhone: async(req, res) => {
        try {
            let code = await Code.findById(req.body._id);
            if(code.code==req.body.code.toLowerCase()){
                let user = await User.findOne({phone:code.medium});
                res.status(200).json({status:1,data:user.id});
            }else{
                res.status(500).json({status:0,data:['Código incorrecto']});
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    newPassword: async (req, res) => {
        try {
            if(req.body.password.length>7&&req.body.password.length<17){
                req.body.password = await bcrypt.hash(req.body.password,global.config.token.bcrypt_salt_rounds);
                let user = await User.findByIdAndUpdate(req.body._id,{password:req.body.password,passwordFailures:0}, {fields:userData,new: true });
                let token= await Token.encode(user,global.config.token.days); 
                res.status(200).json({status:1,data:user,token:token});
            }else{
                res.status(500).json({status:0,data:['Debe tener entre 8 y 16 caracteres.']});
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    newPasswordEmail: async (req, res) => {
        try {
            let token2 = await Token.decodeEmail(req.body.token);
            if(token2.status==200){
                let code = await Code.findById(token2.code._id);
                console.log(code);
                if(code&&code.code == token2.code.code){
                    await Code.remove({_id:token2.code._id})
                    if(req.body.password.length>7&&req.body.password.length<17){
                        req.body.password = await bcrypt.hash(req.body.password,global.config.token.bcrypt_salt_rounds);
                        let user = await User.findOneAndUpdate({email:code.medium},{password:req.body.password,passwordFailures:0}, {fields:userData,new: true });
                        let token = await Token.encode(user,global.config.token.days); 
                        res.status(200).json({status:1,data:true,token:token});
                    }else{
                        res.status(500).json({status:0,data:['Debe tener entre 8 y 16 caracteres.']});
                    }
                }else{
                    res.status(500).json({status:0,data:['Tiempo expirado']});
                }
            }else{
                res.status(500).json({status:0,data:['Tiempo expirado2']});
            }            
        } catch (err) {
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyUser: async (req, res) => {
        try {
            let user = await User.findOne({userName:req.body.userName});
            if(!user){
                let user = await User.findByIdAndUpdate(req.user._id,req.body, {fields:userData,new: true });
                res.status(200).json({status:1,data:user,token:req.token});
                
            }else{ 
                res.status(500).json({status:0,data:['Usuario ya utilizado por otra persona']});
            }
        } catch (err) {            
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyUserFirst: async (req, res) => {
        try {
            let user = await User.findOne({userName:req.body.userName});
            if(!user){
                let userValidate = await User.findById(req.user._id);
                if(userValidate.modify.length>0){
                    let modify = false;
                    userValidate.modify.forEach(element => {
                        if (element == 'username') {
                            modify = true;
                        }
                    });
                    if(modify){
                        req.body.$pull = {modify:'username'};
                        let user = await User.findByIdAndUpdate(req.user._id,req.body, {fields:userData,new: true });
                        res.status(200).json({status:1,data:user,token:req.token});
                    }else{
                        res.status(500).json({status:0,data:['No tiene permisos para modificar este dato'],token:req.token});
                    }                
                }else{
                    res.status(500).json({status:0,data:['No tiene permisos para modificar este dato'],token:req.token});
                }
            }else{ 
                res.status(500).json({status:0,data:['Usuario ya utilizado por otra persona']});
            }
        } catch (err) {            
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyPhone: async (req, res) => {
        try {
            let user = await User.findOne({phone:req.body.phone});            
            if(!user){
                let code = RandString.create(8);
                await Code.remove({medium:req.body.phone})
                let body = `
                    <p>Hola ${req.user.name}, tu código de actualización de datos es el siguiente:</p>
                    <h1>${code}</h1>
                    <p>Equipo de MLOLX</p>
                `
                const result=await EmailService.send(req.user.email,'MLOLX','Recuperar contraseña',body);
                let newCode = new Code({
                    medium:req.body.phone,
                    code:code
                });                
                let codeNew = await newCode.save();
                res.status(200).json({status:1,data:codeNew._id,token:req.token});
            }else{
                res.status(500).json({status:0,data:['Celular ya utilizado por otra persona']});
            }
        } catch (err) {            
            res.status(500).json({status:0,data:[err]});
        }
    },
    newPhone: async (req, res) => {
        try {
            let code = await Code.findById(req.body._id);
            if(code.code==req.body.code){
                let user = await User.findByIdAndUpdate(req.user._id,{phone:code.medium}, {fields:userData,new: true });
                res.status(200).json({status:1,data:user,token:req.token});
            }else{
                res.status(500).json({status:0,data:['Codigo incorrecto']});
            }
        } catch (err) {            
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyEmail: async (req, res) => {
        try {
            let user = await User.findOne({email:req.body.email});            
            if(!user){
                let code = RandString.create(8);
                await Code.remove({medium:req.body.email})
                console.log(code)
                let send =await Message.sendMessage('Tu codigo de actualización de datos es: '+code,req.user.phone);
                
                let newCode = new Code({
                    medium:req.body.email,
                    code:code
                });                
                let codeNew = await newCode.save();
                res.status(200).json({status:1,data:codeNew._id,token:req.token});
            }else{
                res.status(500).json({status:0,data:['Correo ya utilizado por otra persona']});
            }
        } catch (err) {            
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    newEmail: async (req, res) => {
        try {
            let code = await Code.findById(req.body._id);
            if(code.code==req.body.code){
                let user = await User.findByIdAndUpdate(req.user._id,{email:code.medium}, {fields:userData,new: true });
                res.status(200).json({status:1,data:user,token:req.token});
            }else{
                res.status(500).json({status:0,data:['Codigo incorrecto']});
            }
        } catch (err) {            
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    me: async (req, res) => {
        try {
            let user = await User.findById(req.user,userData);
            res.status(200).json({status:1,data:user,token:req.token});
        } catch (err) {            
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyPassword: async (req, res) => {
        try {
            let user = await User.findById(req.user._id);
            let match = await bcrypt.compare(req.body.password,user.password);
            if(match){
                if(req.body.passwordNew==req.body.passwordConfirmed){
                    if(req.body.passwordNew.length>7&&req.body.passwordNew.length<17){
                        let password = await bcrypt.hash(req.body.passwordNew,global.config.token.bcrypt_salt_rounds);
                        let user = await User.findByIdAndUpdate(req.user._id,{password:password}, {fields:userData,new: true });
                        res.status(200).json({status:1,data:user,token:req.token});
                    }else{
                        res.status(500).json({status:0,data:['La contraseña debe tener entre 8 y 16 caracteres.']}); 
                    }
                }else{
                    res.status(500).json({status:0,data:['Contraseñas no coinciden']}); 
                }
            }else{
                res.status(500).json({status:0,data:['Contraseña incorrecta']});
            }
        } catch (err) {            
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyName: async (req, res) => {
        try {
            let userValidate = await User.findById(req.user._id);
            if(userValidate.modify.length>0){
                let modify = false;
                userValidate.modify.forEach(element => {
                    if (element == 'name') {
                        modify = true;
                    }
                });
                if(modify){
                    req.body.$pull = {modify:'name'};
                    let user = await User.findByIdAndUpdate(req.user._id,req.body, {fields:userData,new: true });
                    res.status(200).json({status:1,data:user,token:req.token});
                }else{
                    res.status(500).json({status:0,data:['No tiene permisos para modificar estos datos'],token:req.token});
                }                
            }else{
                res.status(500).json({status:0,data:['No tiene permisos para modificar estos datos'],token:req.token});
            }
                     
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyIdentification: async (req, res) => {
        try {
            let userValidate = await User.findById(req.user._id);
            if(userValidate.modify.length>0){
                let modify = false;
                userValidate.modify.forEach(element => {
                    if (element == 'identification') {
                        modify = true;
                    }
                });
                if(modify){
                    req.body.$pull = {modify:'identification'};
                    let user = await User.findByIdAndUpdate(req.user._id,req.body, {fields:userData,new: true });
                    res.status(200).json({status:1,data:user,token:req.token});
                }else{
                    res.status(500).json({status:0,data:['No tiene permisos para modificar este dato'],token:req.token});
                }                
            }else{
                res.status(500).json({status:0,data:['No tiene permisos para modificar este dato'],token:req.token});
            }         
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyPhoto: async (req, res) => {
        try {
            let image = await Files.uploadImage(req.body.photo);
            let user = await User.findByIdAndUpdate(req.user._id,{photo:image}, {fields:userData,new: true });
            res.status(200).json({status:1,data:user,token:req.token});          
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyLocation: async (req, res) => {
        try {
            let userValidate = await User.findById(req.user._id);
            if(userValidate.modify.length>0){
                let modify = false;
                userValidate.modify.forEach(element => {
                    if (element == 'location') {
                        modify = true;
                    }
                });
                if(modify){
                    req.body.$pull = {modify:'location'};
                    let user = await User.findByIdAndUpdate(req.user._id,req.body, {fields:userData,new: true });                    
                    let product = await Product.update({user:req.user._id},{$set:req.body},{multi:true})
                    res.status(200).json({status:1,data:user,token:req.token});
                }else{
                    res.status(500).json({status:0,data:['No tiene permisos para modificar estos datos'],token:req.token});
                }                
            }else{
                res.status(500).json({status:0,data:['No tiene permisos para modificar estos datos'],token:req.token});
            }        
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    modifyDocument: async (req, res) => {
        try {
            let user = await User.findById(req.user._id);
            if(user.photoDocumentSend==0){
                let image = await Files.uploadImage(req.body.photoDocument);
                let user = await User.findByIdAndUpdate(req.user._id,{photoDocument:image,photoDocumentSend:1}, {fields:userData,new: true });
                res.status(200).json({status:1,data:user,token:req.token}); 
            }else{
                res.status(500).json({status:0,data:['Ya usted envió su foto del documento'],token:req.token}); 
            }
                     
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    recordUser: async (req, res) =>{
        try {
            let user = await User.update({status:2},{record:0,recordBuyer:0})
            res.status(200).json({status:1,data:user});
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    record: async (req, res) =>{
        try {
            let user = await User.findById(req.user._id,{record:1,recordBuyer:1})
            res.status(200).json({status:1,data:user});
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    referred: async (req, res) =>{
        try {
            let group = { type: "$type" };
            let match = {user:ObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$gt:0},type:'referred'};
            let entry= await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            match = {user:ObjectId(req.user._id),$or:[{status:1},{status:2}],amount:{$lt:0},type:'referred'};
            let egress= await Payment.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            let referred = await User.find({referred:req.user._id},{name:1,lastName:1,photo:1,balanceReferred:1,createdAt:1,userName:1,city:1,department:1})
            res.status(200).json({status:1,data:{referred,entry,egress}});
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    operations: async (req, res) => {
        try {
            let seller = await User.find({},{userName:1,name:1,lastName:1,photo:1,record:1}).sort({record:-1}).limit(20);
            let buyer = await User.find({},{userName:1,name:1,lastName:1,photo:1,recordBuyer:1}).sort({recordBuyer:-1}).limit(20);
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
            let group = { type: "$highlight" };
            let match = { $or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date} };
            let buy = await Product.aggregate([ 
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            console.log(buy);
            let publication = {};
            let active = await Product.countDocuments({ status:1 });
            for (let i = 0; i < buy.length; i++) {
                publication[buy[i]._id.type] = buy[i].count;                
            }
            res.status(200).json({status:1,data:{seller,buyer,publication,active}});
        } catch (err) {   
            console.log(err)
            res.status(500).json({status:0,data:[err]});
        }
    },
    userNew: async(req, res) =>{
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
                    date.setDate(date.getDate() - 3000);
                break;
            }
            group = { type: "$status" };
            let users = await User.find({$or:[ { status:1 }, { status:2 } ],createdAt:{$gt:date}});           
            
            res.status(200).json({ status:1, data: { users } });
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    userActive: async(req, res) =>{
        try {
            let count = await Buy.countDocuments({$or:[ { status:1 }, { status:2 } ]});
            let numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let users = await User.find({$or:[ { status:1 }, { status:2 } ]}).skip(skip).limit(parseInt(req.query.limit)).sort({$natural:-1});
            res.status(200).json({ status:1, data: { users, numPages } });
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    operationsSeller: async(req, res) =>{
        try {
            let count = await Buy.countDocuments({$or:[ { status:1 }, { status:2 } ]});
            let numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let seller = await User.find({},{userName:1,name:1,lastName:1,photo:1,record:1}).skip(skip).limit(parseInt(req.query.limit)).sort({record:-1});
            res.status(200).json({ status:1, data: { seller, numPages } });
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    operationsBuyer: async(req, res) =>{
        try {
            let count = await Buy.countDocuments({$or:[ { status:1 }, { status:2 } ]});
            let numPages = parseInt((count/req.query.limit)+1);
            let skip = (parseInt(req.query.skip)-1)*parseInt(req.query.limit);
            let buyer = await User.find({},{userName:1,name:1,lastName:1,photo:1,recordBuyer:1}).skip(skip).limit(parseInt(req.query.limit)).sort({recordBuyer:-1});
            res.status(200).json({ status:1, data: { buyer, numPages } });
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    recordInfo: async(req, res) =>{
        try {
            let group = { type: "$qualifyBuyer" };
            let match = {buyer:ObjectId(req.query._id)};
            let buyer = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);

            group = { type: "$qualifySeller" };
            match = {user:ObjectId(req.query._id)};
            let seller = await Buy.aggregate([
                { $match : match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);

            let user = await User.findById(req.query._id)

            res.status(200).json({status:1,data:{buyer,seller,user},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    },
    birthdate: async (req, res) =>{
        try {
            let date = new Date();
            console.log({month:date.getMonth()+1,day:date.getDate()})
            let user = await User.find({month:date.getMonth()+1,day:date.getDate()});
            res.status(200).json({status:1,data:{user},token:req.token});
        } catch (err) {
            console.log(err);
            res.status(500).json({status:0,data:[err]});
        }
    }
}