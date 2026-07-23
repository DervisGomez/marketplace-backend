function serializeLegacyUpdateResult(result) {
    return {
        n: result.matchedCount,
        nModified: result.modifiedCount,
        ok: result.acknowledged ? 1 : 0
    };
}

function serializeLegacyDeleteResult(result) {
    return {
        deletedCount: result.deletedCount,
        n: result.deletedCount,
        ok: result.acknowledged ? 1 : 0
    };
}

module.exports = {
    deleteResult: serializeLegacyDeleteResult,
    updateResult: serializeLegacyUpdateResult
};
