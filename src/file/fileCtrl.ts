const logger = require('../infrastructure/logging/logger');
//let File = require('./fileSchema');
let cloudinary = require('cloudinary').v2;
let fs = require('fs');
let RandString = require('../../../services/randString');

interface UploadResult {
    readonly secure_url: string;
}

const runtime = globalThis as typeof globalThis & { resul: UploadResult };

module.exports = {
    uploadImages: async (images: readonly string[]): Promise<string[]> => {
        try {
            let response = [];
            for (let index = 0; index < images.length; index++) {
                let image = images[index];
                if (!image.includes('http')) {
                    let base64 = image.split(',');
                    let ext = base64[0].split(';')[0].split('/')[1];
                    let buff = Buffer.from(base64[1], 'base64');
                    let nameImagen = await RandString.create(8);
                    await fs.writeFileSync('uploads/' + nameImagen + '.' + ext, buff);
                    logger.debug('uploads/' + nameImagen + '.' + ext);
                    runtime.resul = await cloudinary.uploader.upload('uploads/' + nameImagen + '.' + ext, {
                        resource_type: 'image'
                    });
                    response.push(runtime.resul['secure_url']);
                    logger.debug(response);
                    void fs.promises.unlink('uploads/' + nameImagen + '.' + ext).catch(() => undefined);
                } else {
                    response.push(image);
                }
            }
            logger.debug('URL::>', response);
            return response;
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return [];
        }
    },
    uploadImage: async (image: string): Promise<string | readonly never[]> => {
        try {
            let response = '';
            let base64 = image.split(',');
            let ext = base64[0].split(';')[0].split('/')[1];
            let buff = Buffer.from(base64[1], 'base64');
            let nameImagen = await RandString.create(8);
            await fs.writeFileSync('uploads/' + nameImagen + '.' + ext, buff);
            logger.debug('uploads/' + nameImagen + '.' + ext);
            runtime.resul = await cloudinary.uploader.upload('uploads/' + nameImagen + '.' + ext, {
                resource_type: 'image'
            });
            response = runtime.resul['secure_url'];
            logger.debug(response);
            void fs.promises.unlink('uploads/' + nameImagen + '.' + ext).catch(() => undefined);

            logger.debug('URL::>', response);
            return response;
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return [];
        }
    }
};
