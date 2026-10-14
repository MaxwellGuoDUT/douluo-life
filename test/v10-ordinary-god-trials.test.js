import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createV10ContentLoader } from '../js/v10-content-loader.js';
import { createV10LifeRunner } from '../js/v10-life-runner.js';
import { projectV10SourceCharacter } from '../js/v10-human-runner.js';
import { createV10SaveStore, SAVE_PREFIX } from '../js/v10-save-store.js';
import { V10_GOD_TRIAL_STAGES as stages, V10_GOD_TRIAL_POOLS as pools,
    V10_GOD_TRIAL_SEMANTICS, planV10GodTrialReward } from '../js/v10-god-trial-runtime.js';

globalThis.document ??= { createElement: () => ({ relList: { supports: () => true }, addEventListener(n, f) { if (n === 'load') queueMicrotask(f); }, setAttribute() {} }),
    getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} } };
globalThis.window ??= { dispatchEvent() {} };
const root = new URL('../', import.meta.url);
const loader = createV10ContentLoader({ moduleBaseUrl: root.href, fetchImpl: async p => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(new URL(p, root), 'utf8')) }) });
const runner = createV10LifeRunner({ contentLoader: loader });
const baseline = (async () => {
    const life = await runner.start('douluo1', { seed: 'ascension-directed-3', route: 'human' });
    for (let i = 0; i < 90; i++) assert.equal(life.step().error, null);
    return life.exportSnapshot();
})();
const selections = { 一级: ['ddb29f', '雷神'], 三级: ['c4723a', '锐金之神'], 神王: ['fcac00', '修罗神位考核'] };
// Explicit mechanism fixture. This is never reported as an organically rolled life.
async function fixture(tier) {
    const snapshot = structuredClone(await baseline), tierStages = stages.filter(s => s.tier === tier);
    const [deityId, deityName] = selections[tier];
    snapshot.session.character.godTrial = { ...snapshot.session.character.godTrial, tier,
        deityId, deityName, trialId: deityId, deitySelection: { optionId: deityId, text: deityName },
        tierSelection: { optionId: {一级:'ee1504',三级:'d33dec',神王:'48f196'}[tier], text: tier + '神考核' }, currentStage: 1, totalStages: tierStages.length, total: tierStages.length };
    snapshot.session.character.level = 99;
    snapshot.session.character.soulBones = ['head','torso','leftArm','rightArm','leftLeg','rightLeg'].map(partId => ({ id: partId, name: partId, partId, years: 100000 }));
    snapshot.session.currentFlowId = 'humanGodTrialContinue';
    snapshot.session.currentPoolId = null;
    snapshot.session.pendingNextStepId = null;
    snapshot.session.awaitingAdvance = false;
    return snapshot;
}

for (const tier of ['一级', '三级', '神王']) {
    test(`mechanism: ${tier} every stage follows source continuation, replay and godhood without an artificial ending`, async () => {
        const snapshot = await fixture(tier), game = (await loader.getSourceRuntime('douluo1')).game;
        const life = await runner.start('douluo1', { seed: snapshot.seed, route: 'human', snapshot });
        const visited = [], checkpoints = [];
        for (let i = 0; i < 120 && life.session.character.godTrial.status === 'active'; i++) {
            const before = life.exportSnapshot(), wheel = life.wheelView;
            assert.deepEqual(life.exportSnapshot(), before, 'view must not consume random or mutate history');
            const result = life.step();
            assert.equal(result.error, null, JSON.stringify(result.error));
            const stage = stages.find(s => s.poolId === result.spin?.poolId);
            if (!stage) continue;
            assert.equal(stage.tier, tier);
            visited.push(stage.stage);
            const expected = structuredClone(before.session);
            expected.character = projectV10SourceCharacter(expected.character);
            const option = pools.find(p => p.id === stage.poolId).options.find(o => o.id === result.spin.optionId);
            game.customHandlers.claimHumanGodTrialReward({ state: expected, step: { id: stage.stepId, poolId: stage.poolId }, option });
            for (const key of ['level','maxLevel','godhood','godhoods','godTrial','domains','traits','artifacts','soulBones','appearanceRank','martialSouls','ending']) {
                assert.deepEqual(life.session.character[key], expected.character[key], `${tier} ${stage.stage} ${key}`);
            }
            assert.deepEqual(life.session.pendingSoulBone, expected.pendingSoulBone);
            if ([1, 4, stages.filter(s => s.tier === tier).length].includes(stage.stage)) {
                const replay = await runner.start('douluo1', { seed: snapshot.seed, route: 'human', snapshot: before });
                assert.equal(replay.step().error, null);
                assert.deepEqual(replay.exportSnapshot(), life.exportSnapshot());
                checkpoints.push(stage.stage);
            }
            assert.ok(wheel.status === 'dynamic' || wheel.segments.some(s => s.optionId === result.spin.optionId));
        }
        assert.deepEqual(visited, stages.filter(s => s.tier === tier).map(s => s.stage));
        assert.equal(checkpoints.length, 3);
        assert.equal(life.session.character.godhood.id, selections[tier][0]);
        assert.equal(life.session.character.godhood.tier, tier);
        assert.ok(life.session.character.level >= 100);
        assert.equal(life.session.character.ending, null);
        const saved = life.exportSnapshot();
        const restored = await runner.start('douluo1', { seed: saved.seed, route: 'human', snapshot: saved });
        for (let i = 0; i < 3; i++) {
            assert.equal(life.step().error, null); assert.equal(restored.step().error, null);
        }
        assert.deepEqual(restored.exportSnapshot(), life.exportSnapshot());
    });
}

test('tier-specific gates, duplicate rewards and unknown tiers never select another tier pool', async () => {
    const index = { pack: { v10GodTrialSemantics: V10_GOD_TRIAL_SEMANTICS }, getFlow: () => true };
    for (const stage of stages) {
        const session = { character: { level: stage.minLevel - 1, godTrial: { tier: stage.tier, status: 'active', deityId: 'fixture', currentStage: stage.stage, claimedRewardStages: [] } } };
        assert.equal(planV10GodTrialReward(index, session), null);
        session.character.level++;
        assert.equal(planV10GodTrialReward(index, session).target, stage.stepId);
        session.character.godTrial.claimedRewardStages.push(stage.stage);
        assert.equal(planV10GodTrialReward(index, session), null);
    }
    assert.throws(() => planV10GodTrialReward(index, { character: { level: 99, godTrial: { tier: 'seaGod', status: 'active', deityId: 'fixture', currentStage: 1, claimedRewardStages: [] } } }), { code: 'V10_GOD_TRIAL_STATE_INVALID' });
});

test('new reward failure restores direct source changes, history and RNG; /5 saves remain exportable and cannot overwrite', async () => {
    const broken = { ...loader, getSourceRuntime: async id => {
        const source = await loader.getSourceRuntime(id);
        if (id !== 'douluo1') return source;
        return { ...source, game: { ...source.game, customHandlers: { ...source.game.customHandlers,
            claimHumanGodTrialReward(context) { source.game.customHandlers.claimHumanGodTrialReward(context); context.applyEffects([{ type: 'unknown-trial-fixture-effect' }]); } } } };
    } };
    const snapshot = await fixture('一级');
    snapshot.session.currentFlowId = stages.find(s => s.tier === '一级').stepId;
    const life = await createV10LifeRunner({ contentLoader: broken }).start('douluo1', { seed: snapshot.seed, route: 'human', snapshot });
    const before = life.exportSnapshot(), result = life.step();
    assert.equal(result.error.code, 'UNSUPPORTED_APK_EFFECT');
    assert.deepEqual(life.exportSnapshot(), before);
    const old = structuredClone(snapshot); old.runtimeSemantics = 'douluo1:second-tier-god-trial/5';
    await assert.rejects(runner.start('douluo1', { seed: old.seed, route: 'human', snapshot: old }), { code: 'V10_SNAPSHOT_SEMANTICS_CHANGED' });
    const raw = JSON.stringify({ schemaVersion: 'v10-local-save/1.0', packId: 'douluo1', contentIdentity: 'old-fixture', snapshot: old });
    const data = new Map([[SAVE_PREFIX + 1, raw]]);
    const store = createV10SaveStore({ contentLoader: loader, runner, storage: () => ({ getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) }) });
    assert.equal(await store.exportSlot(1, { rawBackup: true }), raw);
    await assert.rejects(store.read(1), { code: 'SAVE_CONTENT_MISMATCH' });
    await assert.rejects(store.write(1, raw, { expected: raw, overwrite: true }), { code: 'SAVE_CONTENT_MISMATCH' });
    assert.equal(data.get(SAVE_PREFIX + 1), raw);
});
