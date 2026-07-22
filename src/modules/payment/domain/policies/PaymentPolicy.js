module.exports = {
    // Política documental. No se aplica durante la migración estructural.
    withdrawalAmount(amount) {
        return parseInt(amount) * -1;
    }
};
