export const V05_DESTINY_COHORT_SCHEMA = "douluo-life-v05-destiny-cohort/1.0";
export const V05_DESTINY_CANDIDATE_COUNT = 256;
export const V05_DESTINY_MINIMUM_COHORT = 12;

function typedError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) deepFreeze(child);
    return Object.freeze(value);
}

function validString(value) {
    return typeof value === "string" && value.length > 0;
}

export function validateV05DestinyManifest(manifest) {
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)
        || manifest.schemaVersion !== V05_DESTINY_COHORT_SCHEMA
        || !validString(manifest.packageVersion)
        || manifest.endpointAge !== 25
        || !Array.isArray(manifest.coverage)
        || !Array.isArray(manifest.destinies)
        || manifest.coverage.length !== V05_DESTINY_CANDIDATE_COUNT
        || manifest.destinies.length < V05_DESTINY_MINIMUM_COHORT) {
        throw typedError("V05_DESTINY_MANIFEST_INVALID", "正式命运 manifest 的 schema 或规模无效。");
    }
    const expectedSeeds = Array.from(
        { length: V05_DESTINY_CANDIDATE_COUNT },
        (_, index) => `v05-destiny-${String(index).padStart(3, "0")}`
    );
    const coverageSeeds = manifest.coverage.map(record => record?.seed);
    if (!expectedSeeds.every((seed, index) => coverageSeeds[index] === seed)) {
        throw typedError("V05_DESTINY_MANIFEST_INVALID", "256-seed coverage 域或排序无效。");
    }
    const coverageBySeed = new Map(manifest.coverage.map(record => [record.seed, record]));
    const ids = new Set();
    const seeds = new Set();
    const digests = new Set();
    for (const destiny of manifest.destinies) {
        const coverage = coverageBySeed.get(destiny?.seed);
        const valid = validString(destiny?.id)
            && validString(destiny?.seed)
            && validString(destiny?.title)
            && validString(destiny?.summary)
            && destiny?.schemaVersion === V05_DESTINY_COHORT_SCHEMA
            && destiny?.packageVersion === manifest.packageVersion
            && destiny?.endpointAge === 25
            && Number.isInteger(destiny?.committedCount)
            && Number.isInteger(destiny?.randomCursor)
            && validString(destiny?.finalFlowId)
            && validString(destiny?.transcriptDigest)
            && validString(destiny?.characterDigest)
            && validString(destiny?.summaryDigest)
            && Array.isArray(destiny?.coverageTags)
            && coverage?.status === "completed"
            && coverage.age === 25
            && coverage.committedCount === destiny.committedCount
            && coverage.randomCursor === destiny.randomCursor
            && coverage.currentFlowId === destiny.finalFlowId
            && coverage.transcriptDigest === destiny.transcriptDigest
            && coverage.characterDigest === destiny.characterDigest
            && coverage.summaryDigest === destiny.summaryDigest;
        if (!valid || ids.has(destiny.id) || seeds.has(destiny.seed) || digests.has(destiny.summaryDigest)) {
            throw typedError("V05_DESTINY_MANIFEST_INVALID", "正式命运记录无效、重复或与 coverage 不一致。", {
                destinyId: destiny?.id ?? null,
                seed: destiny?.seed ?? null
            });
        }
        ids.add(destiny.id);
        seeds.add(destiny.seed);
        digests.add(destiny.summaryDigest);
    }
    return manifest;
}

export function createV05DestinyViewModel(manifest) {
    validateV05DestinyManifest(manifest);
    return deepFreeze(manifest.destinies.map(destiny => ({
        id: destiny.id,
        seed: destiny.seed,
        title: destiny.title,
        summary: destiny.summary,
        endpointAge: destiny.endpointAge,
        committedCount: destiny.committedCount,
        randomCursor: destiny.randomCursor,
        primaryMartialSoul: destiny.primaryMartialSoul,
        soulRingCount: destiny.soulRingCount,
        routeSummary: destiny.routeSummary,
        milestoneIds: clone(destiny.milestoneIds),
        coverageTags: clone(destiny.coverageTags),
        official: true,
        experimental: false
    })));
}

export function getV05Destiny(manifest, destinyId) {
    validateV05DestinyManifest(manifest);
    const record = manifest.destinies.find(destiny => destiny.id === destinyId);
    if (!record) {
        throw typedError("V05_DESTINY_NOT_FOUND", `未找到正式命运 ${String(destinyId)}。`, {
            destinyId: destinyId ?? null
        });
    }
    return deepFreeze(clone(record));
}

export default Object.freeze({
    V05_DESTINY_COHORT_SCHEMA,
    V05_DESTINY_CANDIDATE_COUNT,
    V05_DESTINY_MINIMUM_COHORT,
    validateV05DestinyManifest,
    createV05DestinyViewModel,
    getV05Destiny
});
