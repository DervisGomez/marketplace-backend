function create(Model, methods, options) {
    const settings = options || {};
    const repository = {};

    methods.forEach(method => {
        if (method === 'create') {
            repository.create = data => settings.callableCreate ? Model(data) : new Model(data);
            return;
        }

        repository[method] = (...args) => Model[method](...args);
    });

    return repository;
}

module.exports = { create };
