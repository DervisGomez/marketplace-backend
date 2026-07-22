module.exports = {
    // Política documental; no se aplica aún para preservar el flujo legacy.
    canStart(quantity) {
        return quantity > 0;
    }
};
