import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createV10ContentLoader } from '../js/v10-content-loader.js';
import { createV10LifeRunner } from '../js/v10-life-runner.js';
import { createV10SaveStore, SAVE_PREFIX, MAX_SAVE_BYTES } from '../js/v10-save-store.js';
globalThis.document ??= { createElement() { return { relList: { supports: () => true }, addEventListener(n, f) { if(n === 'load') queueMicrotask(f); }, setAttribute() {} }; }, getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} } };
globalThis.window ??= { dispatchEvent: () => true };
const root = new URL('../', import.meta.url);
const loader = createV10ContentLoader({ moduleBaseUrl: root.href, fetchImpl: async path => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8')) }) });
const runner = createV10LifeRunner({ contentLoader: loader });
function fixture(factory = createV10SaveStore) {
    const data = new Map([['old-v05', 'owner save']]);
    const storage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
    return { data, storage, store: factory({ contentLoader: loader, runner, storage: () => storage }) };
}
function advance(life, count = 1000, until = () => false) {
    for(let i = 0; i < count && life.phase === 'ready' && !until(life); i++) {
        const result = life.step(); assert.ok(!result.error, JSON.stringify(result.error));
    }
    return life;
}
for (const [packId, route, seed] of [
    ['douluo1', 'human', 'v10-save-human'], ['douluo1', 'beast', 'v10-beast-cohort-001'],
    ['douluo2', 'human', 'day27-human-3'], ['douluo2', 'beast', 'day27-beast-1']
]) test(`real save/resume ${packId}/${route} including transformation and terminal`, async () => {
    const { store, data } = fixture();
    const life = advance(await runner.start(packId, { seed, route }), 12);
    const independent = advance(await runner.start(packId, { seed, route }), 12);
    const text = await store.serialize(life), before = life.exportSnapshot();
    await store.write(1, text);
    assert.deepEqual(life.exportSnapshot(), before);
    assert.equal(await store.exportSlot(1), text);
    await store.write(2, await store.exportSlot(1));
    const resumed = await store.read(2);
    assert.deepEqual(resumed.exportSnapshot(), before);
    if(route === 'beast' && packId === 'douluo2') {
        advance(life, 1000, value => value.session.character.route === 'transformed');
        assert.equal(life.session.character.route, 'transformed');
        await store.write(3, await store.serialize(life));
        assert.deepEqual((await store.read(3)).exportSnapshot(), life.exportSnapshot());
    }
    advance(life); advance(resumed); advance(independent);
    assert.equal(life.phase, 'completed');
    assert.deepEqual(resumed.exportSnapshot(), independent.exportSnapshot());
    assert.deepEqual(life.exportSnapshot(), independent.exportSnapshot());
    await store.write(4, await store.serialize(life));
    const terminal = await store.read(4);
    assert.equal(terminal.phase, 'completed');
    assert.deepEqual(terminal.exportSnapshot(), life.exportSnapshot());
    assert.equal(terminal.step().committed, false);
    assert.equal(data.get('old-v05'), 'owner save');
});
test('eight slots, overwrite, isolation, stale writes, quota and unavailable storage', async () => {
    const { store, data, storage } = fixture();
    assert.equal(data.size, 1);
    assert.deepEqual((await store.list()).map(s => s.summary), Array(8).fill('空槽'));
    const life = await runner.start('douluo2', { seed: 'day27-human-1' });
    const text = await store.serialize(life);
    for(let slot = 1; slot <= 8; slot++) await store.write(slot, text);
    const before = [...data];
    await assert.rejects(store.write(1, text), { code: 'SAVE_SLOT_CHANGED' });
    await assert.rejects(store.write(1, text, { expected: text }), { code: 'SAVE_OVERWRITE_REQUIRED' });
    await assert.rejects(store.write(9, text), { code: 'SAVE_INVALID' });
    assert.deepEqual([...data], before);
    advance(life, 1);
    const next = await store.serialize(life);
    await store.write(1, next, { expected: text, overwrite: true });
    assert.equal(data.get(SAVE_PREFIX + 1), next);
    for(let slot = 2; slot <= 8; slot++) assert.equal(data.get(SAVE_PREFIX + slot), text);
    const after = [...data];
    await assert.rejects(store.write(1, text, { expected: text, overwrite: true }), { code: 'SAVE_SLOT_CHANGED' });
    for(const name of ['QuotaExceededError', 'SecurityError', 'Error']) {
        storage.setItem = () => { throw Object.assign(new Error('failed'), { name }); };
        await assert.rejects(store.write(1, text, { expected: next, overwrite: true }), { code: 'SAVE_WRITE_FAILED' });
        assert.deepEqual([...data], after);
    }
    const unavailable = createV10SaveStore({ contentLoader: loader, runner, storage() { throw new Error('denied'); } });
    await assert.rejects(unavailable.read(1), { code: 'SAVE_STORAGE_UNAVAILABLE' });
    assert.ok((await unavailable.list()).every(s => s.error.code === 'SAVE_STORAGE_UNAVAILABLE'));
});
test('untrusted files reject atomically for both packs', async () => {
    for(const packId of ['douluo1', 'douluo2']) {
        const { store, data } = fixture();
        const life = advance(await runner.start(packId, { seed: 'day28-reject' }), 3);
        const text = await store.serialize(life);
        await store.write(1, text);
        const before = [...data], snapshot = life.exportSnapshot();
        const corruptions = [
            v => { v.schemaVersion = 'unknown'; }, v => { v.contentIdentity = 'old'; },
            v => { v.packId = packId === 'douluo1' ? 'douluo2' : 'douluo1'; },
            v => { v.snapshot.session.packId = 'unknown'; }, v => { v.snapshot.schemaVersion = 'unknown'; },
            v => { v.snapshot.session.random.cursor = -1; }, v => { delete v.snapshot.session.character.flags; },
            v => { v.snapshot.session.character.transactions = {}; }, v => { v.snapshot.session.history = [null]; }, v => { v.snapshot.session.history = [{}]; }, v => { v.snapshot.session.routeHistory = [{}]; }, v => { v.snapshot.session.character.wallet = null; }, v => { v.snapshot.session.character.transactions = [{}]; },
            v => { v.snapshot.session.currentFlowId = 'missing-flow'; }, v => { v.snapshot.session.finished = true; }
        ];
        const inputs = ['{broken', 'null', ' '.repeat(MAX_SAVE_BYTES + 1), '{"__proto__":{}}',
            ...corruptions.map(corrupt => { const v = JSON.parse(text); corrupt(v); return JSON.stringify(v); })];
        for(const input of inputs) {
            await assert.rejects(store.write(1, input, { expected: text, overwrite: true }));
            assert.deepEqual([...data], before); assert.deepEqual(life.exportSnapshot(), snapshot);
        }
        data.set(SAVE_PREFIX + 2, '{broken'); const corrupt = [...data];
        assert.ok((await store.list())[1].error);
        await assert.rejects(store.read(2)); assert.deepEqual([...data], corrupt);
    }
});

test('Douluo I transformed snapshot resumes the same next twenty commits', async () => {
    const { store } = fixture();
    const life = await runner.start('douluo1', { seed: 'v10-beast-probe-001', route: 'beast' });
    advance(life, 200, value => value.session.character.route === 'transformed');
    assert.equal(life.session.character.route, 'transformed');
    await store.write(1, await store.serialize(life));
    const resumed = await store.read(1);
    assert.deepEqual(resumed.exportSnapshot(), life.exportSnapshot());
    advance(life, 20); advance(resumed, 20);
    assert.deepEqual(resumed.exportSnapshot(), life.exportSnapshot());
});
for (const candidate of ['serialize', 'shape']) test('ablation A/B: remove duplicate ' + candidate + ' validation', async () => {
    const moduleUrl = new URL('../js/v10-save-store.js', import.meta.url);
    const original = fs.readFileSync(moduleUrl, 'utf8');
    const duplicate = `    requireValue(["transactions", "logs", "talents", "martialSouls", "soulBones", "skills", "traits", "godTrials"].every(key => Array.isArray(character[key]))
        && object(character.flags) && object(character.entrySelections)
        && object(session.forcedResults) && object(session.forcedResultSources), "角色或会话结构损坏。");`;
    const lean = `    requireValue(object(session.forcedResults) && object(session.forcedResultSources), "会话结构损坏。");`;
    const bText = original;
    const aText = candidate === 'shape' ? original.replace(lean, duplicate) : original.replace('            return text;\n        },\n        async read', '            await validate(text);\n            return text;\n        },\n        async read');
    assert.notEqual(aText, bText);
    const load = async text => (await import('data:text/javascript;base64,' + Buffer.from(text.replace(/from "(\.\/[^"]+)"/gu,
        (_match, path) => 'from ' + JSON.stringify(new URL(path, moduleUrl).href))).toString('base64'))).createV10SaveStore;
    const [aFactory, bFactory] = await Promise.all([load(aText), load(bText)]);
    for (const packId of ['douluo1', 'douluo2']) {
        const life = advance(await runner.start(packId, { seed: 'day28-ablation', route: 'beast' }), 12);
        const snapshot = life.exportSnapshot();
        const a = fixture(aFactory), b = fixture(bFactory);
        const exported = [];
        for (const { store, data, storage } of [a, b]) {
            const text = await store.serialize(life);
            await store.write(1, text);
            await store.write(2, await store.exportSlot(1));
            const restored = await store.read(2);
            assert.deepEqual(restored.exportSnapshot(), snapshot);
            advance(restored, 8);
            const next = await store.serialize(restored);
            await store.write(1, next, { expected: text, overwrite: true });
            const before = [...data];
            for (const field of ['transactions', 'logs', 'talents', 'martialSouls', 'soulBones', 'skills', 'traits', 'godTrials', 'flags', 'entrySelections']) {
                const malformed = JSON.parse(text); malformed.snapshot.session.character[field] = null;
                await assert.rejects(store.write(1, JSON.stringify(malformed), { expected: next, overwrite: true }), { code: 'SAVE_INVALID' });
            }
            const corrupt = JSON.parse(text); corrupt.contentIdentity = 'incompatible';
            await assert.rejects(store.write(1, JSON.stringify(corrupt), { expected: next, overwrite: true }), { code: 'SAVE_CONTENT_MISMATCH' });
            await assert.rejects(store.write(1, '{bad', { expected: next, overwrite: true }), { code: 'SAVE_JSON_INVALID' });
            storage.setItem = () => { throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' }); };
            await assert.rejects(store.write(1, text, { expected: next, overwrite: true }), { code: 'SAVE_WRITE_FAILED' });
            assert.deepEqual([...data], before);
            assert.deepEqual(life.exportSnapshot(), snapshot);
            exported.push({ text, next, resumed: restored.exportSnapshot(), slots: [...data] });
        }
        assert.deepEqual(exported[0], exported[1]);
    }
});

test('UI test copy: real runtime rejection displays its error and disables progression', async () => {
    const { runInNewContext } = await import('node:vm');
    const { createV10HumanRunner } = await import('../js/v10-human-runner.js');
    const source = await loader.getSourceRuntime('douluo2');
    const graph = await loader.getRouteGraph('douluo2');
    const customHandlers = { ...source.game.customHandlers };
    delete customHandlers['douluo2:handler.human.country'];
    const broken = createV10HumanRunner({ seed: 'day27-human-1', sourcePack: { ...source, routeGraph: graph, game: { ...source.game, customHandlers } },
        loaded: { routeGraph: { schemaVersion: 'apk-route-graph/1.0', packageVersion: source.manifest.version, packs: [{ ...graph.pack, id: 'douluo2' }] } } });
    const before = broken.exportSnapshot();
    const nodes = new Map();
    const element = () => ({ value: '', textContent: '', dataset: {}, disabled: false, hidden: false, addEventListener() {}, replaceChildren() {}, scrollIntoView() {} });
    const doc = { querySelector(id) { if(!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); }, querySelectorAll: () => [], createElement: element };
    const context = { document: doc, setTimeout, createV10ContentLoader: () => ({ getManifest: async () => ({ packs: [] }) }),
        createV10LifeRunner: () => ({ start: async () => broken }), createV10SaveStore: () => ({ list: async () => [] }) };
    const app = fs.readFileSync(new URL('../js/v10-app.js', import.meta.url), 'utf8').replace(/^import .+;\r?\n/gmu, '');
    runInNewContext(app + '\nglobalThis.testUI = { startLife, runLife };', context);
    await context.testUI.startLife('human', 'douluo2');
    await context.testUI.runLife('step', 'test step');
    assert.ok(['boundary', 'error'].includes(broken.phase));
    assert.match(nodes.get('#human-progress').textContent, /APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED/);
    assert.doesNotMatch(nodes.get('#human-progress').textContent, /运行中/);
    for(const id of ['#human-step', '#human-age', '#human-terminal']) assert.equal(nodes.get(id).disabled, true);
    assert.deepEqual(broken.exportSnapshot(), before);
});
