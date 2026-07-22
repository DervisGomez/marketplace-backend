module.exports = {
    // Política documental; no se aplica durante la migración estructural.
    isVisible(status) {
        return status === 1 || status === 2;
    }
};
