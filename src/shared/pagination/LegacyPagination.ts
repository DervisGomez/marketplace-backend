function toInteger(value: unknown): number {
    return parseInt(String(value));
}

function toNumericOperand(value: unknown): number {
    return value as number;
}

function pages(count: unknown, limit: unknown): number {
    return parseInt(String(toNumericOperand(count) / toNumericOperand(limit) + 1));
}

function offset(skip: unknown, limit: unknown): number {
    return (toInteger(skip) - 1) * toInteger(limit);
}

export { offset, pages };
