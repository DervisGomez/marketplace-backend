const mongoose = require('mongoose');
const jwt = require('jwt-simple');
const moment = require('moment');

const ids = Object.freeze({
    user: new mongoose.Types.ObjectId().toHexString(),
    entity: new mongoose.Types.ObjectId().toHexString(),
    product: new mongoose.Types.ObjectId().toHexString(),
    question: new mongoose.Types.ObjectId().toHexString()
});

function authHeaders() {
    const user = {
        _id: ids.user,
        role: 'user',
        status: 1,
        modify: []
    };
    return {
        authorization: jwt.encode({
            sub: user,
            iat: moment().unix(),
            exp: moment().add(7, 'days').unix()
        }, global.config.token.secret),
        _id: ids.user
    };
}

function body() {
    return {
        _id: ids.entity,
        user: ids.user,
        product: ids.product,
        question: ids.question,
        category: ids.entity,
        chat: ids.entity,
        image: 'data:image/png;base64,dGVzdA==',
        images: [],
        status: 1,
        type: 'test',
        message: 'test',
        title: 'test',
        name: 'Test',
        email: 'test@example.com',
        phone: '3000000000',
        password: 'password',
        passwordNew: 'password',
        code: '1234'
    };
}

function query() {
    return {
        _id: ids.entity,
        user: ids.user,
        product: ids.product,
        question: ids.question,
        category: ids.entity,
        status: '1',
        skip: '1',
        limit: '10',
        search: 'test',
        year: '2020',
        month: '1'
    };
}

module.exports = { ids, authHeaders, body, query };
