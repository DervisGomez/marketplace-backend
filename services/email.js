const config = require('../src/config/config');
const mailjet = require('node-mailjet').connect(config.mailjet.api_key, config.mailjet.secret);

module.exports = {
    send: async (email,name,subject,body) => {
    	let result={};
        const request = mailjet
	    .post("send", {
       		version: 'v3.1'
    	}).request({
			"Messages":[ {
		    	"From": {
		    		"Email": config.mailjet.from_email,
	                "Name": config.mailjet.from_name
	            },
	            "To": [
	                {
	                	"Email": email,
	                    "Name": name
	                }
	            ],
	            "Subject": subject,
	            "TextPart": "1:02pm test",
	            "HTMLPart": body
	        } ]
		})
		await request.then((res) => {
			result.status=1;
			result.body=res.body;
		}).catch((err) => {
			result.status=0;
			result.err=err.statusCode;
		})
		return result;
	}
};
