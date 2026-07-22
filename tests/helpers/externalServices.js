function installExternalServiceFakes() {
    const Files = require('../../src/file/fileCtrl');
    const Message = require('../../services/message');
    const Email = require('../../services/email');

    Files.uploadImage = async () => 'https://external.test/image.jpg';
    Message.sendCode = async () => '1234';
    Message.sendMessage = async () => true;

    for (const method of Object.keys(Email)) {
        if (typeof Email[method] === 'function') Email[method] = async () => true;
    }
}

module.exports = { installExternalServiceFakes };
