import { createApkCharacterState } from "./apk-rule-runtime.js";
// One atomic localStorage value per slot. No migration or writes on startup.
export const SAVE_PREFIX = "douluo-life:v10:manual:1:";
export const MAX_SAVE_BYTES = 4 * 1024 * 1024;
const SCHEMA = "v10-local-save/1.0";
function reject(code, message) { throw Object.assign(new Error(message), { code }); }
function requireValue(condition, message) {
    if (!condition) reject("SAVE_INVALID", message);
}
function object(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function shape(value, template, path) {
    if (template === null) {
        requireValue(value !== undefined, `${path} 字段缺失。`);
    } else if (Array.isArray(template)) {
        requireValue(Array.isArray(value), `${path} 必须为数组。`);
    } else if (object(template)) {
        requireValue(object(value), `${path} 必须为对象。`);
        for (const key of Object.keys(template)) shape(value[key], template[key], `${path}.${key}`);
    } else {
        requireValue(typeof value === typeof template && (typeof value !== "number" || Number.isFinite(value)), `${path} 类型无效。`);
    }
}
function parse(text) {
    if (typeof text !== "string" || new TextEncoder().encode(text).length > MAX_SAVE_BYTES) {
        reject("SAVE_TOO_LARGE", "存档必须是最大4 MiB的 JSON 文件。");
    }
    try {
        return JSON.parse(text, (key, value) => {
            if (["__proto__", "prototype", "constructor"].includes(key)) reject("SAVE_INVALID", "存档含有不允许的对象字段。");
            return value;
        });
    } catch (error) {
        if (error.code) throw error;
        reject("SAVE_JSON_INVALID", "无法解析存档 JSON；原数据未改动。");
    }
}
function validateShape(envelope) {
    requireValue(envelope?.schemaVersion === SCHEMA, "不支持的存档版本。");
    const snapshot = envelope.snapshot;
    requireValue(snapshot?.schemaVersion === "v10-runner-snapshot/1.0", "不支持的快照版本。");
    const session = snapshot.session;
    requireValue(["douluo1", "douluo2"].includes(snapshot.packId)
        && envelope.packId === snapshot.packId && session?.packId === snapshot.packId, "内容包身份不匹配。");
    requireValue(["human", "beast"].includes(snapshot.route) && typeof snapshot.seed === "string"
        && snapshot.seed.length > 0 && snapshot.seed.length <= 4096, "开局路线或 seed 无效。");
    requireValue(session.schemaVersion === "apk-session/1.0" && session.routeSchemaVersion === "apk-route-session/1.0"
        && session.random?.seed === snapshot.seed && session.random.algorithm === "pcg32-counter-v1"
        && Number.isSafeInteger(session.random.cursor) && session.random.cursor >= 0, "会话版本或随机游标无效。");
    requireValue(["history", "routeHistory", "dynamicHistory", "pendingFollowUps", "timeline"].every(key =>
        Array.isArray(session[key]) && session[key].every(object)), "会话记录结构损坏。");
    requireValue(session.history.every(item => typeof item.poolId === "string" && typeof item.optionId === "string"
        && typeof item.text === "string" && Array.isArray(item.effects)
        && Number.isSafeInteger(item.randomCursor) && item.randomCursor >= 0 && item.randomCursor <= session.random.cursor)
        && session.routeHistory.every(item => typeof item.flowId === "string" && typeof item.poolId === "string"
            && typeof item.optionId === "string" && Array.isArray(item.followUpResults))
        && session.dynamicHistory.every(item => typeof item.kind === "string" && typeof item.handlerId === "string")
        && session.timeline.every(item => typeof item.kind === "string" && typeof item.text === "string"), "历史记录字段损坏。");
    const character = session.character;
    requireValue(character?.schemaVersion === "apk-character/1.0"
        && ["human", "beast", "transformed"].includes(character.route)
        && (snapshot.route === "beast" || character.route === "human"), "角色路线结构无效。");
    shape(character, createApkCharacterState(character.route), "character");
    requireValue(character.transactions.every(item => object(item) && typeof item.type === "string"
        && typeof item.idempotencyKey === "string"), "事务记录结构损坏。");
    requireValue(["age", "level", "beastYears"].every(key => Number.isFinite(character[key]) && character[key] >= 0), "角色进度无效。");
    requireValue(object(session.forcedResults) && object(session.forcedResultSources), "会话结构损坏。");
    requireValue(typeof session.finished === "boolean" && typeof session.awaitingAdvance === "boolean"
        && ["ready", "terminal"].includes(session.routeStatus), "会话运行状态无效。");
    requireValue(session.finished ? session.routeStatus === "terminal" && object(character.ending)
        : typeof session.currentFlowId === "string" && !character.ending, "终局与进度不一致。");
    return snapshot;
}

export function saveSummary(snapshot) {
    const { character, history } = snapshot.session;
    return `${snapshot.packId} · ${character.route} · ${character.route === "beast" ? `${character.beastYears}年` : `${character.age}岁`} · 等级${character.level} · ${history.length}次提交 · ${character.ending?.title ?? (snapshot.session.finished ? "终局" : "进行中")}`;
}

export function createV10SaveStore({ contentLoader, runner, storage = () => globalThis.localStorage }) {
    const identities = new Map();
    async function identity(packId) {
        if (!identities.has(packId)) {
            const graph = await contentLoader.getRouteGraph(packId);
            const human = packId === "douluo1" ? await contentLoader.getHumanRuntimeContent() : null;
            const bytes = new TextEncoder().encode(JSON.stringify([SCHEMA, graph, human]));
            const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
            identities.set(packId, Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join(""));
        }
        return identities.get(packId);
    }
    function key(slot) {
        requireValue(Number.isInteger(slot) && slot >= 1 && slot <= 8, "请选择1至8号槽位。");
        return SAVE_PREFIX + slot;
    }
    function raw(slot) {
        const name = key(slot);
        try { return storage().getItem(name); }
        catch { reject("SAVE_STORAGE_UNAVAILABLE", "无法读取本地存储；请检查浏览器存储权限。"); }
    }
    async function validate(text) {
        const envelope = parse(text);
        const snapshot = validateShape(envelope);
        if (envelope.contentIdentity !== await identity(snapshot.packId)) {
            reject("SAVE_CONTENT_MISMATCH", "存档内容版本与当前游戏不兼容。");
        }
        // Restore a separate runtime. No step, RNG draw, or mutation of the active life.
        const restored = await runner.start(snapshot.packId, { seed: snapshot.seed, route: snapshot.route, snapshot });
        // Reading the current wheel also verifies that a nonterminal cursor resolves.
        if (!snapshot.session.finished && !restored.wheelView) reject("SAVE_INVALID", "存档当前流程不可读取。");
        return { snapshot, restored };
    }
    return Object.freeze({
        raw,
        async list() {
            return Promise.all(Array.from({ length: 8 }, async (_, index) => {
                const slot = index + 1;
                try {
                    const text = raw(slot);
                    return { slot, text, summary: text === null ? "空槽" : saveSummary((await validate(text)).snapshot) };
                } catch (error) { return { slot, error, summary: `${error.code ?? "SAVE_INVALID"}：${error.message}` }; }
            }));
        },
        async serialize(life) {
            const snapshot = life.exportSnapshot();
            const text = JSON.stringify({ schemaVersion: SCHEMA, packId: snapshot.packId,
                contentIdentity: await identity(snapshot.packId), snapshot });
            return text;
        },
        async read(slot) {
            const text = raw(slot);
            if (text === null) reject("SAVE_EMPTY", "该槽位为空。");
            return (await validate(text)).restored;
        },
        async exportSlot(slot) {
            const text = raw(slot);
            if (text === null) reject("SAVE_EMPTY", "该槽位为空。");
            await validate(text);
            return text;
        },
        async write(slot, text, { expected = null, overwrite = false } = {}) {
            const name = key(slot);
            await validate(text);
            const before = raw(slot);
            if (before !== expected) reject("SAVE_SLOT_CHANGED", "槽位内容已变化，请重新选择并确认。");
            if (before !== null && !overwrite) reject("SAVE_OVERWRITE_REQUIRED", "该槽已有存档，必须明确确认覆盖。");
            try { storage().setItem(name, text); }
            catch (error) { reject("SAVE_WRITE_FAILED", `保存失败（${error.name ?? "存储错误"}）；原槽位保持不变。`); }
        }
    });
}
