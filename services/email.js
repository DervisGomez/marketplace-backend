const config = require('../src/config/config');
const Mailjet = require('node-mailjet');

let mailjet;

function getMailjetClient() {
    if (!mailjet) {
        mailjet = Mailjet.apiConnect(config.mailjet.api_key, config.mailjet.secret);
    }

    return mailjet;
}

module.exports = {
    send: async (email, name, subject, body) => {
        let result = {};
        const request = getMailjetClient()
            .post('send', {
                version: 'v3.1'
            })
            .request({
                Messages: [
                    {
                        From: {
                            Email: config.mailjet.from_email,
                            Name: config.mailjet.from_name
                        },
                        To: [
                            {
                                Email: email,
                                Name: name
                            }
                        ],
                        Subject: subject,
                        TextPart: '1:02pm test',
                        HTMLPart: body
                    }
                ]
            });
        await request
            .then(res => {
                result.status = 1;
                result.body = res.body;
            })
            .catch(err => {
                result.status = 0;
                result.err = err.statusCode;
            });
        return result;
    }
};
