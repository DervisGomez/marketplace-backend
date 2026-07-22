module.exports = {
    pages(count, limit) {
        return parseInt((count / limit) + 1);
    },
    offset(skip, limit) {
        return (parseInt(skip) - 1) * parseInt(limit);
    }
};
