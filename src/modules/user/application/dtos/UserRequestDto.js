/**
 * Crea un objeto de entrada independiente de Express.
 * Se preservan todas las propiedades legacy para no cambiar contratos todavía.
 */
function from(body) {
    return Object.assign({}, body);
}

module.exports = { from };
