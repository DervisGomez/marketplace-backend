module.exports = {
    // Política documental. No se usa todavía para no modificar reglas legacy.
    calculatePercent(amount, percent) {
        return amount * parseInt(percent) / 100;
    }
};
