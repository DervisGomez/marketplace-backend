const logger = require('../src/infrastructure/logging/logger');
global.config = require('../config');

let twilio;

function getTwilioClient() {
    if (!twilio) {
        twilio = require('twilio')(global.config.twilio.account_sind, global.config.twilio.auth_token);
    }

    return twilio;
}

module.exports = {
    sendCode: async (body, numberTo) => {
        let codeGenerated = '';
        let possible = '0123456789';
        for (var i = 0; i < 4; i++) {
            codeGenerated += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        let code = await getTwilioClient().messages.create({
            body: body + codeGenerated,
            from: global.config.twilio.phone_number,
            to: '+' + numberTo
        });
        return codeGenerated;
    },
    sendMessage: async (body, numberTo) => {
        try {
            let code = await getTwilioClient().messages.create({
                body: body,
                from: global.config.twilio.phone_number,
                to: '+' + numberTo
            });
            return true;
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return false;
        }
    }
};
