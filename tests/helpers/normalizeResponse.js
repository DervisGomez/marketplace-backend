function normalize(value, key) {
    if (Array.isArray(value)) return value.map(item => normalize(item));
    if (!value || typeof value !== 'object') {
        if (typeof value === 'string') {
            if (/^[a-f\d]{24}$/i.test(value)) return '<object-id>';
            if (/^eyJ[\w-]+\./.test(value)) return '<token>';
            if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return '<date>';
        }
        return value;
    }

    return Object.keys(value).sort().reduce((result, property) => {
        if (property === '__v') return result;
        result[property] = normalize(value[property], property);
        return result;
    }, {});
}

function responseContract(response) {
    return {
        status: response.status,
        contentType: response.headers['content-type'] || null,
        cors: response.headers['access-control-allow-origin'] || null,
        body: normalize(response.body && Object.keys(response.body).length ? response.body : response.text)
    };
}

module.exports = { normalize, responseContract };
