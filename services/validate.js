const logger = require('../src/infrastructure/logging/logger');
module.exports = {
    coordinates: async (lati, long) => {
        if (lati && long) {
            let errors = [];
            let latitude = parseFloat(lati);
            let longitude = parseFloat(long);
            if (latitude > 90 || latitude < -90) errors.push('Latitud invalidad');
            if (longitude > 180 || longitude < -180) errors.push('Longitud invalida');
            if (errors.length > 0) return { status: 0, data: errors };
            return { status: 1, data: { type: 'Point', coordinates: [longitude, latitude] } };
        } else {
            return { status: 2, data: { type: 'Point', coordinates: [0, 0] } };
        }
    },
    required: async err => {
        logger.error({ err: err }, 'Legacy operation failed');
        let errors = [];
        if (err.errors) {
            let keys = Object.keys(err.errors);
            for (var i = keys.length - 1; i >= 0; i--) {
                errors.push(err.errors[keys[i]].message);
            }
        }
        return errors;
    }
};
