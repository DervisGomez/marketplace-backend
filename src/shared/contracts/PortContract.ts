interface NamedPort<TName extends string> {
    readonly name: TName;
}

function definePort<const TName extends string>(name: TName): Readonly<NamedPort<TName>> {
    return Object.freeze({ name });
}

export { definePort };
export type { NamedPort };
