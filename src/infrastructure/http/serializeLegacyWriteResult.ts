interface ModernUpdateResult {
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
}

interface ModernDeleteResult {
    acknowledged: boolean;
    deletedCount: number;
}

interface LegacyUpdateResult {
    n: number;
    nModified: number;
    ok: number;
}

interface LegacyDeleteResult {
    deletedCount: number;
    n: number;
    ok: number;
}

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
