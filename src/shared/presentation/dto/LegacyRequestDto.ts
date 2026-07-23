function from<T extends Readonly<Record<string, unknown>>>(body: T): T {
    return Object.assign({}, body);
}

export { from };
