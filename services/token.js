let jwt = require('jwt-simple');
let moment = require('moment');

async function createToken (user,days) {
    let payload = {
	    sub : user, // id del usuario
	    iat : moment().unix(), //momento que se ha creado el token
	    exp : moment().add(days,'days').unix() //momento que sera expirado el token
	};
    const newToken = jwt.encode(payload,global.config.token.secret);
    return newToken;        
}

module.exports = {
    encode: (user,days)=>{
    	return createToken(user,days);
    },
    decode: async (token) => {
        if(token){
            try{
            	const payload = jwt.decode(token,global.config.token.secret);
	            if(payload.exp < moment().unix()) {
	                const newToken = await createToken(payload.sub,global.config.token.days);	                
	                return {status:200, user:payload.sub, token:newToken};
	            }else{
	            	return {status:200, user:payload.sub };
	            }                
            }catch(e){
                console.log(e)
                return {status:403};
            }
        }
        next();
    }, 
    decodeEmail: async (token) => {
        if(token){
            try{
            	const payload = jwt.decode(token,global.config.token.secret);
	            if(payload.exp < moment().unix()) {	                
	                return {status:200, code:payload.sub};
	            }else{
	            	return {status:200, code:payload.sub };
	            }                
            }catch(e){
                console.log(e)
                return {status:403};
            }
        }else{
            console.log('no token')
            return {status:403};
        }
    },    
};