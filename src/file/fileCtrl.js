//let File = require('./fileSchema');
let cloudinary = require('cloudinary').v2;
let fs = require('fs');
let RandString = require('../../services/randString');

module.exports = {
    uploadImages: async(images) => {
        try {
            let response = [];
            for (let index = 0; index < images.length; index++)  {
                let image = images[index];
                if(!image.includes('http')){
                    let base64 =image.split(',');
                    let ext = base64[0].split(';')[0].split('/')[1]
                    let buff = await new Buffer.from(base64[1], 'base64');
                    let nameImagen = await RandString.create(8);
                    await fs.writeFileSync('uploads/'+nameImagen+'.'+ext, buff);
                    console.log('uploads/'+nameImagen+'.'+ext);
                    resul = await cloudinary.uploader.upload('uploads/'+nameImagen+'.'+ext,{ resource_type: 'image'});
                    response.push(resul['secure_url']);
                    console.log(response);
                    await fs.unlink('uploads/'+nameImagen+'.'+ext,(err) => {}); 
                }else{
                    response.push(image)
                }
                 
            };
            console.log('URL::>',response);
            return response;
        } catch (error) {
            console.log(error);
            return [];
        }        
    },
    uploadImage: async(image) => {
        try {
            let response = '';       
                let base64 =image.split(',');
                let ext = base64[0].split(';')[0].split('/')[1]
                let buff = await new Buffer.from(base64[1], 'base64');
                let nameImagen = await RandString.create(8);
                await fs.writeFileSync('uploads/'+nameImagen+'.'+ext, buff);
                console.log('uploads/'+nameImagen+'.'+ext);
                resul = await cloudinary.uploader.upload('uploads/'+nameImagen+'.'+ext,{ resource_type: 'image'});
                response = resul['secure_url'];
                console.log(response);
                await fs.unlink('uploads/'+nameImagen+'.'+ext,(err) => {});  
            
            console.log('URL::>',response);
            return response;
        } catch (error) {
            console.log(error);
            return [];
        }        
    },
}