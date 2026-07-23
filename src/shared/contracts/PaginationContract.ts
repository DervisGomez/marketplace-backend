interface PaginationRequest {
    readonly limit: unknown;
    readonly skip: unknown;
}

interface PaginationMetadata {
    readonly numPages: number;
}

interface PaginatedResult<TItem> extends PaginationMetadata {
    readonly items: readonly TItem[];
}

export type { PaginatedResult, PaginationMetadata, PaginationRequest };
