const Files = require('../../../../file/fileCtrl');

module.exports = {
    uploadImages: (images: readonly string[]) => Files.uploadImages(images)
};
