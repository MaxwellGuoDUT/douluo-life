import fs from 'node:fs/promises';
import { createV10ContentLoader } from '../../js/v10-content-loader.js';
import { createV10LifeRunner } from '../../js/v10-life-runner.js';
import { createV10SaveStore } from '../../js/v10-save-store.js';
import { V10_GOD_TRIAL_STAGES as stages, V10_GOD_TRIAL_SEMANTICS } from '../../js/v10-god-trial-runtime.js';

const root = new URL('../../', import.meta.url);
globalThis.document ??= { createElement: () => ({ relList: { supports: () => true }, addEventListener(n, f) { if (n === 'load') queueMicrotask(f); }, setAttribute() {} }),
    getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} } };
globalThis.window ??= { dispatchEvent() {} };
const loader = createV10ContentLoader({ moduleBaseUrl: root.href, fetchImpl: async p => ({ ok: true, json: async () => JSON.parse(await fs.readFile(new URL(p, root), 'utf8')) }) });
const runner = createV10LifeRunner({ contentLoader: loader });
const cases = [['一级','god-trial-tail-20261001-002'],['三级','god-trial-tail-20261001-003'],
    ['三级','god-trial-tail-20261001-013'],['神王','ascension-directed-633']];
const results = [], exports = [];
for (const [targetTier, seed] of cases) {
    const life = await runner.start('douluo1', { seed, route: 'human' });
    const rewards = []; let firstBefore = null, postGodhood = 0, error = null, calls = 0;
    const start = performance.now();
    for (; calls < 350 && life.phase === 'ready';) {
        // Snapshot only the first visible target reward, never mutate its state.
        const trial = life.session.character.godTrial;
        if (!firstBefore && trial?.tier === targetTier && trial.status === 'active'
            && trial.currentStage === 1 && life.session.character.level >= 40) firstBefore = life.exportSnapshot();
        const result = life.step(); calls++;
        if (result.error) { error = result.error; break; }
        const stage = stages.find(s => s.poolId === result.spin?.poolId);
        if (stage) rewards.push({ tier: stage.tier, stage: stage.stage, call: calls, poolId: stage.poolId, optionId: result.spin.optionId, level: life.session.character.level, age: life.session.character.age });
        if (life.session.character.godhood && ++postGodhood >= 20) break;
    }
    const final = life.exportSnapshot();
    const record = { targetTier, seed, calls, phase: life.phase, error, rewards,
        trial: life.session.character.godTrial, godhood: life.session.character.godhood,
        ending: life.session.character.ending, level: life.session.character.level, age: life.session.character.age,
        randomCursor: life.session.random.cursor, history: life.session.history.length, durationMs: performance.now() - start };
    if (firstBefore) {
        const a = await runner.start('douluo1', { seed, route: 'human', snapshot: firstBefore });
        const b = await runner.start('douluo1', { seed, route: 'human', snapshot: firstBefore });
        for (let i = 0; i < 20 && a.phase === 'ready'; i++) { a.step(); b.step(); }
        record.restoredNext20Equal = JSON.stringify(a.exportSnapshot()) === JSON.stringify(b.exportSnapshot());
        const store = createV10SaveStore({ contentLoader: loader, runner, storage: () => ({ getItem: () => null }) });
        exports.push([targetTier, await store.serialize(await runner.start('douluo1', { seed, route: 'human', snapshot: firstBefore }))]);
    }
    results.push(record);
    console.log(JSON.stringify(record));
}
if (process.argv.includes('--write-evidence')) {
    const output = new URL('docs/evidence/ordinary-god-trials-20261012/', root);
    await fs.mkdir(output, { recursive: true });
    await fs.writeFile(new URL('natural-journeys.json', output), JSON.stringify({ runtimeSemantics: V10_GOD_TRIAL_SEMANTICS, node: process.version, platform: process.platform, maxCallsPerLife: 350, results }, null, 2) + '\n');
    for (const [tier, text] of exports) await fs.writeFile(new URL('natural-' + tier + '-before-first-reward.json', output), text);
}
if (results.some(r => r.error) || ['一级','三级','神王'].some(tier => !results.some(r => r.rewards.some(s => s.tier === tier)))) process.exitCode = 1;
