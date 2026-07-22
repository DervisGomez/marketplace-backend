'use strict';
exports.create = (id,name) => {
    let suggestions = new Array();
    let possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var j = 0; j < 3; j++){
        let randSuggestions="";
        for (var i = 0; i < 3; i++){
            randSuggestions += possible.charAt(Math.floor(Math.random() * possible.length)) ;
        }
        let textSuggestions = id;
        if(j==1)
            textSuggestions += name.replace(" ","");
        suggestions.push(textSuggestions+randSuggestions);
    }
    return suggestions;
}
