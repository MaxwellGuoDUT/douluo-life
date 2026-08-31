import { snapshotV05Character } from "./v05-life-presentation.js";

export const V05_SAVE_KEY = "douluo-life:v05:checkpoint";
export const V05_SAVE_SCHEMA = "douluo-life-v05-save";
export const V05_SAVE_SCHEMA_VERSION = 3;
export const V05_SAVE_LEGACY_SCHEMA_VERSION = 1;
export const V05_SAVE_DAY22_SCHEMA_VERSION = 2;

function typedError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
}

function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
    }
    return value;
}

export function stableV05Stringify(value) {
    return JSON.stringify(stableValue(value));
}

export function digestV05Value(value) {
    const text = stableV05Stringify(value);
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function transcript(runner) {
    return (runner?.session?.routeHistory ?? []).map(({ flowId, poolId, optionId }) => ({
        flowId,
        poolId,
        optionId
    }));
}

export function createV05ContentIdentity({
    routeGraph,
    packId,
    appVersion,
    officialBeastElementEvidence = null,
    humanSoulRingEvidence = null,
    followUpPrepareEvidence = null,
    supportedDestinies = null
} = {}) {
    const pack = routeGraph?.packs?.find(candidate => candidate?.id === packId) ?? null;
    return Object.freeze({
        appVersion,
        packId,
        routeSchemaVersion: routeGraph?.schemaVersion ?? null,
        packageVersion: routeGraph?.packageVersion ?? null,
        contentFingerprint: digestV05Value({
            schemaVersion: routeGraph?.schemaVersion ?? null,
            packageVersion: routeGraph?.packageVersion ?? null,
            pack,
            officialBeastElementEvidence,
            humanSoulRingEvidence,
            followUpPrepareEvidence,
            supportedDestinies
        })
    });
}

export function createV05Checkpoint({
    runner,
    contentIdentity,
    destinyId = runner?.destinyId ?? "custom",
    savedAt
} = {}) {
    const session = runner?.session;
    const phase = runner?.phase;
    const persistentPhase = phase === "advancing" ? "ready" : phase;
    if (!session || !["ready", "completed", "boundary"].includes(persistentPhase)
        || session.history?.length !== runner.presentationHistory?.length) {
        throw typedError("V05_SAVE_PHASE_INVALID", "只有完整提交点、完成态或 typed boundary 可以保存。", {
            phase: phase ?? null
        });
    }
    return Object.freeze({
        schema: V05_SAVE_SCHEMA,
        schemaVersion: V05_SAVE_SCHEMA_VERSION,
        appVersion: contentIdentity?.appVersion ?? null,
        packageIdentity: contentIdentity,
        destinyId,
        seed: runner.seed ?? session.random?.seed ?? null,
        phase: persistentPhase,
        committedCount: session.history?.length ?? 0,
        randomCursor: session.random?.cursor ?? 0,
        age: session.character?.age ?? null,
        level: session.character?.level ?? null,
        currentFlowId: session.currentFlowId ?? null,
        routeStatus: session.routeStatus ?? null,
        historyCount: session.history?.length ?? 0,
        routeHistoryCount: session.routeHistory?.length ?? 0,
        presentationCount: runner.presentationHistory?.length ?? 0,
        transcriptDigest: digestV05Value(transcript(runner)),
        characterDigest: digestV05Value(snapshotV05Character(session.character)),
        boundaryCode: persistentPhase === "boundary" ? runner.error?.code ?? null : null,
        savedAt: savedAt ?? new Date().toISOString()
    });
}

function validateObject(envelope) {
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
        throw typedError("V05_SAVE_SCHEMA_INVALID", "本地存档不是有效对象。");
    }
    if (envelope.schema !== V05_SAVE_SCHEMA) {
        throw typedError("V05_SAVE_SCHEMA_INVALID", "本地存档 schema 不匹配。", {
            schema: envelope.schema ?? null
        });
    }
    if (![V05_SAVE_LEGACY_SCHEMA_VERSION, V05_SAVE_DAY22_SCHEMA_VERSION, V05_SAVE_SCHEMA_VERSION].includes(envelope.schemaVersion)) {
        throw typedError("V05_SAVE_VERSION_UNSUPPORTED", "本地存档版本不受支持。", {
            schemaVersion: envelope.schemaVersion ?? null
        });
    }
    const integers = ["committedCount", "randomCursor", "historyCount", "routeHistoryCount", "presentationCount"];
    if (typeof envelope.seed !== "string" || envelope.seed.length === 0
        || !["ready", "completed", "boundary"].includes(envelope.phase)
        || integers.some(key => !Number.isInteger(envelope[key]) || envelope[key] < 0)
        || typeof envelope.transcriptDigest !== "string"
        || typeof envelope.characterDigest !== "string") {
        throw typedError("V05_SAVE_SCHEMA_INVALID", "本地存档缺少关键字段或字段类型错误。");
    }
    if ([V05_SAVE_DAY22_SCHEMA_VERSION, V05_SAVE_SCHEMA_VERSION].includes(envelope.schemaVersion)
        && (typeof envelope.destinyId !== "string" || envelope.destinyId.length === 0)) {
        throw typedError("V05_SAVE_SCHEMA_INVALID", "Day22 存档缺少 destinyId。");
    }
    return envelope;
}

export function parseV05Save(raw) {
    if (raw === null || raw === undefined || raw === "") return null;
    try {
        return validateObject(typeof raw === "string" ? JSON.parse(raw) : raw);
    } catch (error) {
        if (error?.code) throw error;
        throw typedError("V05_SAVE_SCHEMA_INVALID", "本地存档 JSON 已损坏。", {
            cause: error?.message ?? String(error)
        });
    }
}

function assertContentIdentity(actual, expected) {
    if (!actual || !expected
        || actual.appVersion !== expected.appVersion
        || actual.packId !== expected.packId
        || actual.routeSchemaVersion !== expected.routeSchemaVersion
        || actual.packageVersion !== expected.packageVersion
        || actual.contentFingerprint !== expected.contentFingerprint) {
        throw typedError("V05_SAVE_CONTENT_MISMATCH", "存档与当前 V0.5 内容包不一致。", {
            actual,
            expected
        });
    }
}

function replayMismatch(envelope, replayed, field) {
    throw typedError("V05_SAVE_REPLAY_MISMATCH", `确定性重放校验失败：${field}`, {
        field,
        saved: envelope[field],
        replayed: replayed[field]
    });
}

function deriveDestinyId(envelope, destinyManifest) {
    if (envelope.schemaVersion >= V05_SAVE_DAY22_SCHEMA_VERSION) return envelope.destinyId;
    const match = destinyManifest?.destinies?.find(destiny => destiny.seed === envelope.seed);
    return match?.id ?? "custom";
}

function assertDestinyIdentity(envelope, destinyManifest) {
    if (envelope.destinyId === "custom") return;
    const destiny = destinyManifest?.destinies?.find(candidate => candidate.id === envelope.destinyId);
    if (!destiny || destiny.seed !== envelope.seed) {
        throw typedError("V05_SAVE_DESTINY_MISMATCH", "存档 destinyId 与当前正式命运 manifest 不一致。", {
            destinyId: envelope.destinyId,
            seed: envelope.seed
        });
    }
}

export function restoreV05Checkpoint({
    raw,
    createRunner,
    contentIdentity,
    destinyManifest = null
} = {}) {
    const envelope = parseV05Save(raw);
    if (!envelope) return null;
    const migrating = envelope.schemaVersion !== V05_SAVE_SCHEMA_VERSION;
    if (!migrating) {
        assertContentIdentity(envelope.packageIdentity, contentIdentity);
        assertDestinyIdentity(envelope, destinyManifest);
    }
    if (typeof createRunner !== "function") {
        throw typedError("V05_SAVE_REPLAY_MISMATCH", "缺少确定性重放 runner factory。");
    }
    const destinyId = deriveDestinyId(envelope, destinyManifest);
    const runner = createRunner(envelope.seed, destinyId);
    for (let index = 0; index < envelope.committedCount; index += 1) {
        const result = runner.step();
        if (!result.committed) replayMismatch(envelope, createV05Checkpoint({ runner, contentIdentity }), "committedCount");
    }
    if (envelope.phase === "boundary") {
        const boundary = runner.step();
        if (boundary.committed || boundary.status !== "boundary") {
            if (migrating) {
                throw typedError(
                    "V05_SAVE_BOUNDARY_SEMANTICS_CHANGED",
                    "旧 boundary 已被 Day23 runtime 闭合；原存档已保留，且不会自动推进。",
                    {
                        seed: envelope.seed,
                        previousBoundaryCode: envelope.boundaryCode,
                        currentStatus: boundary.status,
                        currentCommitted: boundary.committed
                    }
                );
            }
            replayMismatch(envelope, createV05Checkpoint({ runner, contentIdentity, destinyId }), "phase");
        }
        if (migrating && boundary.error?.code !== envelope.boundaryCode) {
            throw typedError(
                "V05_SAVE_BOUNDARY_SEMANTICS_CHANGED",
                "旧 boundary 在 Day23 runtime 中已改变；原存档已保留。",
                {
                    seed: envelope.seed,
                    previousBoundaryCode: envelope.boundaryCode,
                    currentBoundaryCode: boundary.error?.code ?? null
                }
            );
        }
    }
    const replayed = createV05Checkpoint({
        runner,
        contentIdentity,
        destinyId,
        savedAt: envelope.savedAt
    });
    for (const field of [
        ...(migrating ? [] : ["appVersion"]), "seed", "phase", "committedCount", "randomCursor", "age", "level",
        "currentFlowId", "routeStatus", "historyCount", "routeHistoryCount",
        "presentationCount", "transcriptDigest", "characterDigest", "boundaryCode"
    ]) {
        if (!Object.is(envelope[field], replayed[field])) replayMismatch(envelope, replayed, field);
    }
    return Object.freeze({
        envelope: migrating ? replayed : envelope,
        sourceEnvelope: migrating ? envelope : null,
        runner,
        migrated: migrating
    });
}

function storageError(operation, error) {
    return typedError("V05_SAVE_STORAGE_UNAVAILABLE", `本地存档${operation}失败。`, {
        name: error?.name ?? null,
        message: error?.message ?? String(error)
    });
}

export function readV05Save(storage) {
    try {
        return parseV05Save(storage?.getItem(V05_SAVE_KEY) ?? null);
    } catch (error) {
        if (error?.code?.startsWith("V05_SAVE_") && error.code !== "V05_SAVE_STORAGE_UNAVAILABLE") {
            throw error;
        }
        throw storageError("读取", error);
    }
}

export function writeV05Save(storage, envelope) {
    validateObject(envelope);
    try {
        storage?.setItem(V05_SAVE_KEY, JSON.stringify(envelope));
        return envelope;
    } catch (error) {
        throw storageError("写入", error);
    }
}

export function clearV05Save(storage) {
    try {
        storage?.removeItem(V05_SAVE_KEY);
    } catch (error) {
        throw storageError("清除", error);
    }
}

export default Object.freeze({
    V05_SAVE_KEY,
    V05_SAVE_SCHEMA,
    V05_SAVE_SCHEMA_VERSION,
    V05_SAVE_LEGACY_SCHEMA_VERSION,
    V05_SAVE_DAY22_SCHEMA_VERSION,
    stableV05Stringify,
    digestV05Value,
    createV05ContentIdentity,
    createV05Checkpoint,
    parseV05Save,
    restoreV05Checkpoint,
    readV05Save,
    writeV05Save,
    clearV05Save
});
