interface ModernUpdateResult {
    readonly acknowledged: boolean;
    readonly matchedCount: number;
    readonly modifiedCount: number;
}

interface ModernDeleteResult {
    readonly acknowledged: boolean;
    readonly deletedCount: number;
}

interface LegacyUpdateResult {
    readonly n: number;
    readonly nModified: number;
    readonly ok: number;
}

interface LegacyDeleteResult {
    readonly deletedCount: number;
    readonly n: number;
    readonly ok: number;
}

type RepositoryResult<T> = Promise<T>;
type NullableRepositoryResult<T> = RepositoryResult<T | null>;
type RepositoryListResult<T> = RepositoryResult<readonly T[]>;

export type {
    LegacyDeleteResult,
    LegacyUpdateResult,
    ModernDeleteResult,
    ModernUpdateResult,
    NullableRepositoryResult,
    RepositoryListResult,
    RepositoryResult
};
