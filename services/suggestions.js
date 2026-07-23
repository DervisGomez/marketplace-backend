'use strict';
let User = require('../models/userSchema'),
    suggestionsId = require('../services/suggestionsId');
exports.create = username => {
    let next = true;
    let suggestions = new Array();
    let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    while (next) {
        let randSuggestions = username;
        for (var i = 0; i < 3; i++) {
            randSuggestions += possible.charAt(Math.floor(Math.random() * possible.length));
        }
    }
    let auxSuggestions = suggestionsId.create(idWonder, name);
    User.findOne({
        $or: [{ idWonder: auxSuggestions[0] }, { idWonder: auxSuggestions[1] }, { idWonder: auxSuggestions[2] }]
    })
        .then(user => {
            if (user) {
                create(idWonder, name);
            }
        })
        .catch(err => {
            return res.status(500).send({ message: 'Error en el servidor' });
        });

    let suggestions = new Array();
    let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var j = 0; j < 3; j++) {
        let randSuggestions = '';
        for (var i = 0; i < 3; i++) {
            randSuggestions += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        let textSuggestions = id;
        if (j == 1) textSuggestions += name.replace(' ', '');
        suggestions.push(textSuggestions + randSuggestions);
    }

    return auxSuggestions;
};
