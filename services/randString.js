'use strict';
exports.create = (count = 8) => {
    let rand = '';
    let possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < count; i++){
        rand += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return rand;
}
