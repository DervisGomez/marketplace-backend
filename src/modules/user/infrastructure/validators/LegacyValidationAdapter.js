const Validate = require('../../../../../services/validate');

module.exports = {
    required: error => Validate.required(error)
};
