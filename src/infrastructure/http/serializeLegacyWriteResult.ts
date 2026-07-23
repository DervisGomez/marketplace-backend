import type {
    LegacyDeleteResult,
    LegacyUpdateResult,
    ModernDeleteResult,
    ModernUpdateResult
} from '../../shared/contracts/RepositoryResultContract';

function serializeLegacyUpdateResult(result: ModernUpdateResult): LegacyUpdateResult {
    return {
        n: result.matchedCount,
        nModified: result.modifiedCount,
        ok: result.acknowledged ? 1 : 0
    };
}

function serializeLegacyDeleteResult(result: ModernDeleteResult): LegacyDeleteResult {
    return {
        deletedCount: result.deletedCount,
        n: result.deletedCount,
        ok: result.acknowledged ? 1 : 0
    };
}

export const deleteResult = serializeLegacyDeleteResult;
export const updateResult = serializeLegacyUpdateResult;
