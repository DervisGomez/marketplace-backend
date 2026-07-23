interface MappableDocument extends Record<string, unknown> {
    readonly toObject?: () => Record<string, unknown>;
}

export type { MappableDocument };
