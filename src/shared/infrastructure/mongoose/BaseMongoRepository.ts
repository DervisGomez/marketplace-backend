type RepositoryMethod = (...args: readonly unknown[]) => unknown;

type ModelLike = {
    new (data: unknown): unknown;
    (data: unknown): unknown;
} & Record<string, unknown>;

interface RepositoryOptions {
    readonly callableCreate?: boolean;
}

function create(
    Model: ModelLike,
    methods: readonly string[],
    options?: Readonly<RepositoryOptions>
): Record<string, RepositoryMethod> {
    const settings = options || {};
    const repository: Record<string, RepositoryMethod> = {};

    methods.forEach(method => {
        if (method === 'create') {
            repository.create = data => (settings.callableCreate ? Model(data) : new Model(data));
            return;
        }

        repository[method] = (...args: readonly unknown[]) => {
            const implementation = Model[method] as RepositoryMethod;
            return Reflect.apply(implementation, Model, args);
        };
    });

    return repository;
}

export { create };
