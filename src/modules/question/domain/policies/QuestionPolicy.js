module.exports = {
    // Política documental; no se usa durante esta migración estructural.
    answeredAt(answer) {
        return answer ? new Date() : undefined;
    }
};
