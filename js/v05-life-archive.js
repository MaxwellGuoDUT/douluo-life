import { digestV05Value } from "./v05-save-store.js";
import { snapshotV05Character } from "./v05-life-presentation.js";

export const V05_LIFE_ARCHIVE_KEY = "douluo-life:v05:life-archive";
export const V05_LIFE_ARCHIVE_SCHEMA = "douluo-life-v05-life-archive";
export const V05_LIFE_ARCHIVE_SCHEMA_VERSION = 1;
export const V05_LIFE_ARCHIVE_LIMIT = 50;

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

function integrityPayload(record) {
    const { integrityDigest: _ignored, ...payload } = record;
    return payload;
}

function validateRecord(record) {
    const valid = record?.schemaVersion === V05_LIFE_ARCHIVE_SCHEMA_VERSION
        && typeof record.archiveId === "string"
        && typeof record.summaryDigest === "string"
        && typeof record.destinyId === "string"
        && typeof record.seed === "string"
        && typeof record.packageVersion === "string"
        && typeof record.completedAt === "string"
        && record.age === 25
        && Number.isFinite(record.level)
        && Number.isFinite(record.currency)
        && typeof record.routeSummary === "string"
        && Array.isArray(record.martialSouls)
        && Array.isArray(record.soulRings)
        && Array.isArray(record.soulBones)
        && Array.isArray(record.milestones)
        && typeof record.ending === "string"
        && Number.isInteger(record.committedCount)
        && typeof record.transcriptDigest === "string"
        && typeof record.characterDigest === "string"
        && typeof record.integrityDigest === "string"
        && record.integrityDigest === digestV05Value(integrityPayload(record))
        && !("session" in record)
        && !("history" in record)
        && !("routeHistory" in record);
    if (!valid) {
        throw typedError("V05_ARCHIVE_RECORD_INVALID", "人生图鉴记录无效或已被篡改。", {
            archiveId: record?.archiveId ?? null
        });
    }
    return record;
}

export function parseV05LifeArchive(raw) {
    if (raw === null || raw === undefined || raw === "") {
        return deepFreeze({
            schema: V05_LIFE_ARCHIVE_SCHEMA,
            schemaVersion: V05_LIFE_ARCHIVE_SCHEMA_VERSION,
            records: []
        });
    }
    let archive;
    try {
        archive = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (error) {
        throw typedError("V05_ARCHIVE_SCHEMA_INVALID", "人生图鉴 JSON 已损坏。", {
            cause: error?.message ?? String(error)
        });
    }
    if (!archive || typeof archive !== "object" || Array.isArray(archive)
        || archive.schema !== V05_LIFE_ARCHIVE_SCHEMA) {
        throw typedError("V05_ARCHIVE_SCHEMA_INVALID", "人生图鉴 schema 无效。");
    }
    if (archive.schemaVersion !== V05_LIFE_ARCHIVE_SCHEMA_VERSION) {
        throw typedError("V05_ARCHIVE_VERSION_UNSUPPORTED", "人生图鉴版本不受支持。", {
            schemaVersion: archive.schemaVersion ?? null
        });
    }
    if (!Array.isArray(archive.records) || archive.records.length > V05_LIFE_ARCHIVE_LIMIT) {
        throw typedError("V05_ARCHIVE_SCHEMA_INVALID", "人生图鉴 records 无效。");
    }
    const digests = new Set();
    for (const record of archive.records) {
        validateRecord(record);
        if (digests.has(record.summaryDigest)) {
            throw typedError("V05_ARCHIVE_RECORD_INVALID", "人生图鉴包含重复摘要。");
        }
        digests.add(record.summaryDigest);
    }
    return deepFreeze(clone(archive));
}

function routeSummary(runner) {
    const character = runner.session.character;
    const faction = character.faction?.optionId ?? character.faction?.text ?? "independent";
    const talent = character.talentProgression?.talentGrade ?? "ungraded";
    return `${character.route ?? "unknown"}:${faction}:${talent}`;
}

export function createV05LifeArchiveRecord({
    runner,
    destinyId = runner?.destinyId ?? "custom",
    packageVersion,
    completedAt
} = {}) {
    if (!runner || runner.phase !== "completed" || runner.session?.character?.age !== 25 || !runner.summary) {
        throw typedError("V05_ARCHIVE_COMPLETED_ONLY", "人生图鉴只接受已完成的25岁人生。");
    }
    const character = runner.session.character;
    const snapshot = snapshotV05Character(character);
    const martialSouls = clone(runner.summary.martialSouls ?? []);
    const soulRings = martialSouls.flatMap(soul => (soul.rings ?? []).map((ring, index) => ({
        martialSoulId: soul.id,
        martialSoulName: soul.name,
        index: index + 1,
        ...clone(ring)
    })));
    const milestones = runner.presentationHistory.flatMap(record => (
        (record.changeLabels ?? []).map(label => ({
            age: record.ageAfter,
            label
        }))
    ));
    const transcriptDigest = digestV05Value(runner.session.routeHistory.map(({
        flowId, poolId, optionId
    }) => ({ flowId, poolId, optionId })));
    const characterDigest = digestV05Value(snapshot);
    const summaryDigest = digestV05Value({
        seed: runner.seed,
        summary: runner.summary,
        transcriptDigest,
        characterDigest
    });
    const record = {
        schemaVersion: V05_LIFE_ARCHIVE_SCHEMA_VERSION,
        archiveId: `life-${summaryDigest.slice(-8)}`,
        summaryDigest,
        destinyId,
        seed: runner.seed,
        packageVersion: String(packageVersion ?? "unknown"),
        completedAt: completedAt ?? new Date().toISOString(),
        age: 25,
        level: Number(character.level ?? 0),
        currency: Number(character.wallet?.copper ?? 0),
        routeSummary: routeSummary(runner),
        martialSouls,
        soulRings,
        soulBones: clone(snapshot.soulBones ?? []),
        milestones,
        ending: "25岁展示终点",
        committedCount: runner.session.history.length,
        transcriptDigest,
        characterDigest
    };
    record.integrityDigest = digestV05Value(record);
    validateRecord(record);
    return deepFreeze(record);
}

function storageError(operation, error) {
    return typedError("V05_ARCHIVE_STORAGE_UNAVAILABLE", `人生图鉴${operation}失败。`, {
        name: error?.name ?? null,
        message: error?.message ?? String(error)
    });
}

export function readV05LifeArchive(storage) {
    try {
        return parseV05LifeArchive(storage?.getItem(V05_LIFE_ARCHIVE_KEY) ?? null);
    } catch (error) {
        if (error?.code?.startsWith("V05_ARCHIVE_") && error.code !== "V05_ARCHIVE_STORAGE_UNAVAILABLE") {
            throw error;
        }
        throw storageError("读取", error);
    }
}

export function addV05LifeArchiveRecord(storage, record) {
    validateRecord(record);
    const archive = readV05LifeArchive(storage);
    const existing = archive.records.find(item => item.summaryDigest === record.summaryDigest);
    if (existing) return Object.freeze({ archive, record: existing, added: false });
    if (archive.records.length >= V05_LIFE_ARCHIVE_LIMIT) {
        throw typedError("V05_ARCHIVE_LIMIT_REACHED", "人生图鉴已满50条；不会自动删除旧人生。", {
            limit: V05_LIFE_ARCHIVE_LIMIT
        });
    }
    const next = {
        schema: V05_LIFE_ARCHIVE_SCHEMA,
        schemaVersion: V05_LIFE_ARCHIVE_SCHEMA_VERSION,
        records: [...archive.records.map(clone), clone(record)]
    };
    try {
        storage?.setItem(V05_LIFE_ARCHIVE_KEY, JSON.stringify(next));
    } catch (error) {
        throw storageError("写入", error);
    }
    return Object.freeze({ archive: deepFreeze(next), record, added: true });
}

export function clearV05LifeArchive(storage) {
    try {
        storage?.removeItem(V05_LIFE_ARCHIVE_KEY);
    } catch (error) {
        throw storageError("清除", error);
    }
}

export default Object.freeze({
    V05_LIFE_ARCHIVE_KEY,
    V05_LIFE_ARCHIVE_SCHEMA,
    V05_LIFE_ARCHIVE_SCHEMA_VERSION,
    V05_LIFE_ARCHIVE_LIMIT,
    parseV05LifeArchive,
    createV05LifeArchiveRecord,
    readV05LifeArchive,
    addV05LifeArchiveRecord,
    clearV05LifeArchive
});
