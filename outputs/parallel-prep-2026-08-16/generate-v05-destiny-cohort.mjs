#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
    V05_APP_VERSION,
    V05_ENDPOINT_AGE,
    createV05ContentIndex,
    createV05DemoRunner
} from "../../js/v05-demo.js";
import {
    V05_DESTINY_COHORT_SCHEMA,
    validateV05DestinyManifest
} from "../../js/v05-destiny-cohort.js";
import { digestV05Value } from "../../js/v05-save-store.js";
import { snapshotV05Character } from "../../js/v05-life-presentation.js";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");
const OUTPUT_PATH = "data/v05-rc/supported-destinies.json";
const CATALOG_ROOT = "data/apk-canonical/catalogs";
const PACKAGE_VERSION = "v05-rc2/2026-08-30";
const SAFETY_CEILING = 512;
const CANDIDATE_COUNT = 512;
const COHORT_COUNT = 24;
const DAY22_COUNT = 12;
const DAY22_DESTINY_ANCHORS = Object.freeze([
    ["official-destiny-01", "v05-destiny-002", "fnv1a32:44a66486", "fnv1a32:23549b41", "fnv1a32:35ef23e2"],
    ["official-destiny-02", "v05-destiny-003", "fnv1a32:31d7eec9", "fnv1a32:90318f02", "fnv1a32:e889d067"],
    ["official-destiny-03", "v05-destiny-008", "fnv1a32:2b07f242", "fnv1a32:e7c59cf4", "fnv1a32:e4e74867"],
    ["official-destiny-04", "v05-destiny-017", "fnv1a32:b2a760e4", "fnv1a32:e5ad725a", "fnv1a32:83741bfc"],
    ["official-destiny-05", "v05-destiny-028", "fnv1a32:42aad93e", "fnv1a32:2164d2cc", "fnv1a32:7329649c"],
    ["official-destiny-06", "v05-destiny-032", "fnv1a32:4a057946", "fnv1a32:d2573a03", "fnv1a32:5bbf5e8a"],
    ["official-destiny-07", "v05-destiny-033", "fnv1a32:ae6066fb", "fnv1a32:9470075c", "fnv1a32:dc46aa57"],
    ["official-destiny-08", "v05-destiny-055", "fnv1a32:efe1e2b7", "fnv1a32:b02cee83", "fnv1a32:9deebda0"],
    ["official-destiny-09", "v05-destiny-065", "fnv1a32:00fb186a", "fnv1a32:e698479a", "fnv1a32:8d57ed73"],
    ["official-destiny-10", "v05-destiny-081", "fnv1a32:5643d8ec", "fnv1a32:a6993ce5", "fnv1a32:1f813b10"],
    ["official-destiny-11", "v05-destiny-092", "fnv1a32:db303bef", "fnv1a32:8ba890d3", "fnv1a32:1c15a03f"],
    ["official-destiny-12", "v05-destiny-175", "fnv1a32:71c86f1d", "fnv1a32:29593ba0", "fnv1a32:010860ba"]
].map(([id, seed, transcriptDigest, characterDigest, summaryDigest]) => Object.freeze({
    id, seed, transcriptDigest, characterDigest, summaryDigest
})));
const TARGET_BOUNDARIES = new Set([
    "APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED",
    "APK_ROUTE_SOUL_RING_EVIDENCE_MISSING"
]);
const RING_CLOSURE_OPTIONS = new Set(["7143b4", "505d78", "6df424", "94604a"]);

function fail(message, details = null) {
    throw new Error(`${message}${details ? `\n${JSON.stringify(details, null, 2)}` : ""}`);
}
function absolute(relativePath) { return path.join(ROOT, ...relativePath.split("/")); }
function readJson(relativePath) { return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8")); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }

function materializeRuntime() {
    const shard = readJson(`${CATALOG_ROOT}/route-graph.douluo1.json`);
    const routeGraph = {
        schemaVersion: "apk-route-graph/1.0",
        packageVersion: shard.packageVersion,
        status: shard.status,
        source: shard.source,
        generatedBy: shard.generatedBy,
        packs: [shard.pack],
        diagnostics: shard.diagnostics
    };
    const loaded = {
        routeGraph,
        formalSpecialResultEvidence: readJson(`${CATALOG_ROOT}/formal-special-result-runtime-evidence.json`),
        humanSoulRingEvidence: readJson(`${CATALOG_ROOT}/human-soul-ring-runtime-evidence.json`),
        followUpPrepareEvidence: readJson(`${CATALOG_ROOT}/followup-prepare-runtime-evidence.json`),
        humanSoulRingSpeciesEvidence: readJson(`${CATALOG_ROOT}/human-soul-ring-species-runtime-evidence.json`),
        officialBeastElementEvidence: readJson(`${CATALOG_ROOT}/official-beast-element-runtime-evidence.json`),
        combatPowerEvidence: readJson(`${CATALOG_ROOT}/combat-power-runtime-evidence.json`)
    };
    return { routeGraph, contentIndex: createV05ContentIndex(loaded) };
}

function loadDay22Baseline() {
    const existing = readJson(OUTPUT_PATH);
    const coverage = existing.coverage ?? [];
    if (![256, 512].includes(coverage.length) || (existing.destinies?.length ?? 0) < DAY22_COUNT) {
        fail("Day22 baseline manifest is unavailable or malformed.");
    }
    const baseline = coverage.slice(0, 256).map(record => (
        coverage.length === 256
            ? {
                seed: record.seed,
                status: record.status,
                errorCode: record.errorCode ?? null,
                operationId: record.operationId ?? null,
                age: record.age ?? null,
                level: record.level ?? null,
                committedCount: record.committedCount ?? null,
                summaryDigest: record.summaryDigest ?? null
            }
            : clone(record.baseline)
    ));
    const expectedSeeds = Array.from({ length: 256 }, (_, index) => `v05-destiny-${String(index).padStart(3, "0")}`);
    if (!baseline.every((record, index) => record?.seed === expectedSeeds[index])) {
        fail("Day22 256-seed baseline order changed.");
    }
    const existingDay22 = existing.destinies.slice(0, DAY22_COUNT);
    for (const [index, anchor] of DAY22_DESTINY_ANCHORS.entries()) {
        for (const field of ["id", "seed", "transcriptDigest", "characterDigest", "summaryDigest"]) {
            if (existingDay22[index]?.[field] !== anchor[field]) {
                fail(`Day22 official destiny anchor changed: ${anchor.id}:${field}`, {
                    expected: anchor[field], actual: existingDay22[index]?.[field] ?? null
                });
            }
        }
    }
    return {
        coverage: baseline,
        destinies: existingDay22.map((destiny, index) => ({
            ...DAY22_DESTINY_ANCHORS[index],
            primaryMartialSoul: clone(destiny.primaryMartialSoul),
            soulRingCount: destiny.soulRingCount,
            routeSummary: destiny.routeSummary,
            coverageTags: clone(destiny.coverageTags)
        }))
    };
}

function transcript(runner) {
    return runner.session.routeHistory.map(({ flowId, poolId, optionId }) => ({ flowId, poolId, optionId }));
}

function milestoneTrail(runner) {
    const seen = new Set();
    const trail = [];
    for (const record of runner.presentationHistory) {
        for (const label of record.changeLabels ?? []) {
            const milestoneId = `milestone-${digestV05Value(label).slice(-8)}`;
            if (seen.has(milestoneId)) continue;
            seen.add(milestoneId);
            trail.push({ milestoneId, label: String(label).slice(0, 64), age: record.ageAfter });
            if (trail.length === 8) return trail;
        }
    }
    return trail;
}

function allMilestoneIds(runner) {
    return [...new Set(runner.presentationHistory.flatMap(record => (
        (record.changeLabels ?? []).map(label => `milestone-${digestV05Value(label).slice(-8)}`)
    )))].sort();
}

function routeSummary(runner) {
    const character = runner.session.character;
    const faction = character.faction?.optionId ?? character.faction?.text ?? "independent";
    const talent = character.talentProgression?.talentGrade ?? "ungraded";
    return `${character.route ?? "unknown"}:${faction}:${talent}`;
}

function ringBand(count) {
    if (count <= 2) return "rings-0-2";
    if (count <= 4) return "rings-3-4";
    if (count <= 6) return "rings-5-6";
    return "rings-7-plus";
}

function levelBand(level) {
    if (level < 40) return "level-below-40";
    if (level < 60) return "level-40-59";
    if (level < 90) return "level-60-89";
    return "level-90-plus";
}

function closureTags(runner) {
    const tags = new Set();
    for (const event of runner.session.dynamicHistory ?? []) {
        if (event.operation === "followUp.prepare.soulBone") tags.add("followup-soul-bone-prepare");
        if (event.handlerId === "prepareSoulRing" && RING_CLOSURE_OPTIONS.has(event.optionId)) {
            tags.add("soul-ring-evidence");
        }
    }
    return [...tags].sort();
}

function summaryPayload(runner) {
    const character = runner.session.character;
    const martialSouls = character.martialSouls ?? [];
    const soulRingCount = martialSouls.reduce((count, soul) => count + (soul.rings?.length ?? 0), 0);
    const soulBoneCount = character.soulBones?.length ?? 0;
    const milestones = allMilestoneIds(runner);
    const primary = martialSouls[0] ?? null;
    const level = Number(character.level ?? 0);
    const route = routeSummary(runner);
    const rings = ringBand(soulRingCount);
    const levels = levelBand(level);
    const growthProfile = `${levels}:${rings}:souls-${martialSouls.length}:bones-${soulBoneCount}`;
    const routeMilestoneProfile = `${route}:${milestones.slice(0, 3).join("+") || "none"}`;
    const closures = closureTags(runner);
    const routeFacets = [
        `route:${route.split(":")[0]}`,
        `talent:${route.split(":")[2]}`,
        `martial:${primary?.category ?? "unknown"}`,
        rings,
        levels
    ];
    const trail = milestoneTrail(runner);
    const pathSignature = digestV05Value({ routeFacets, closures, trail: trail.map(item => item.milestoneId) });
    return {
        primaryMartialSoul: primary ? { id: primary.id ?? null, name: primary.name ?? primary.id ?? "未命名武魂",
            category: primary.category ?? null } : null,
        soulRingCount,
        soulBoneCount,
        routeSummary: route,
        milestoneIds: milestones,
        milestoneTrail: trail,
        pathSignature,
        routeFacets,
        closureTags: closures,
        ringBand: rings,
        levelBand: levels,
        coreProfile: primary?.id ?? primary?.name ?? `route:${character.route ?? "unknown"}`,
        routeMilestoneProfile,
        growthProfile,
        coverageTags: [`core:${primary?.id ?? primary?.name ?? "none"}`, `route:${route}`,
            `growth:${growthProfile}`, rings, levels, ...closures, ...milestones.slice(0, 3)]
    };
}

function scanSeed(runtime, seed, baseline = null) {
    const runner = createV05DemoRunner({ ...runtime, seed });
    let invariantFailure = null;
    try {
        for (let step = 0; step < SAFETY_CEILING && runner.phase === "ready"; step += 1) runner.step();
    } catch (error) { invariantFailure = error; }
    let status = invariantFailure ? "invariant-failure" : runner.phase;
    if (!invariantFailure && runner.phase === "ready") status = "safety-ceiling";
    else if (!invariantFailure && runner.phase === "boundary"
        && (runner.session.character?.ending || runner.session.character?.death)) status = "ending";
    const profile = summaryPayload(runner);
    const endpoint = runner.summary ?? { seed, age: runner.session.character?.age ?? null,
        level: runner.session.character?.level ?? null, route: runner.session.character?.route ?? null,
        error: runner.error ?? null };
    const errorCode = invariantFailure?.code ?? runner.error?.code ?? null;
    const record = {
        seed,
        baseline: baseline ?? { seed, status: "not-in-day22-domain", errorCode: null, operationId: null,
            age: null, level: null, committedCount: null, summaryDigest: null },
        baselineStatus: baseline?.status ?? "not-in-day22-domain",
        baselineErrorCode: baseline?.errorCode ?? null,
        postClosureStatus: status,
        postClosureErrorCode: errorCode,
        rescuedFromBoundary: Boolean(baseline && TARGET_BOUNDARIES.has(baseline.errorCode) && status === "completed"),
        status,
        age: runner.session.character?.age ?? null,
        level: runner.session.character?.level ?? null,
        committedCount: runner.session.history.length,
        randomCursor: runner.session.random.cursor,
        historyCount: runner.session.history.length,
        routeHistoryCount: runner.session.routeHistory.length,
        currentFlowId: runner.session.currentFlowId,
        lastOptionId: runner.lastSpin?.optionId ?? null,
        errorCode,
        operationId: invariantFailure?.details?.operationId ?? runner.error?.details?.operationId ?? null,
        ...profile,
        transcriptDigest: digestV05Value(transcript(runner)),
        characterDigest: digestV05Value(snapshotV05Character(runner.session.character)),
        summaryDigest: digestV05Value(endpoint),
        completionLockVerified: false
    };
    if (runner.phase === "completed") {
        const before = { cursor: runner.session.random.cursor, history: runner.session.history.length,
            routeHistory: runner.session.routeHistory.length };
        const extra = runner.step();
        record.completionLockVerified = extra.blocked === true && extra.reason === "completed"
            && runner.session.random.cursor === before.cursor && runner.session.history.length === before.history
            && runner.session.routeHistory.length === before.routeHistory;
        if (!record.completionLockVerified) fail(`Completion lock drifted for ${seed}.`);
    }
    return record;
}

function diversity(records) {
    return {
        coreProfiles: new Set(records.map(record => record.coreProfile)).size,
        routeMilestoneProfiles: new Set(records.map(record => record.routeMilestoneProfile)).size,
        growthProfiles: new Set(records.map(record => record.growthProfile)).size,
        ringBands: new Set(records.map(record => record.ringBand)).size,
        levelBands: new Set(records.map(record => record.levelBand)).size,
        closureDestinies: records.filter(record => record.closureTags.length > 0).length,
        followUpClosureDestinies: records.filter(record => record.closureTags.includes("followup-soul-bone-prepare")).length,
        soulRingClosureDestinies: records.filter(record => record.closureTags.includes("soul-ring-evidence")).length,
        uniqueSummaryDigests: new Set(records.map(record => record.summaryDigest)).size
    };
}

function selectCohort(completed, day22Destinies) {
    const bySeed = new Map(completed.map(record => [record.seed, record]));
    const selected = day22Destinies.map(anchor => {
        const record = bySeed.get(anchor.seed);
        if (!record) fail(`Day22 official destiny no longer completes: ${anchor.id}`);
        for (const field of ["transcriptDigest", "characterDigest", "summaryDigest"]) {
            if (record[field] !== anchor[field]) fail(`Day22 official destiny drifted: ${anchor.id}:${field}`,
                { expected: anchor[field], actual: record[field] });
        }
        return record;
    });
    const usedSeeds = new Set(selected.map(record => record.seed));
    const usedDigests = new Set(selected.map(record => record.summaryDigest));
    const remaining = completed.filter(record => !usedSeeds.has(record.seed) && !usedDigests.has(record.summaryDigest));
    while (selected.length < COHORT_COUNT && remaining.length > 0) {
        let bestIndex = 0;
        let bestScore = -Infinity;
        for (let index = 0; index < remaining.length; index += 1) {
            const before = diversity(selected);
            const after = diversity([...selected, remaining[index]]);
            const score = (after.followUpClosureDestinies - before.followUpClosureDestinies) * 80
                + (after.soulRingClosureDestinies - before.soulRingClosureDestinies) * 80
                + (after.closureDestinies - before.closureDestinies) * 30
                + (after.ringBands - before.ringBands) * 25
                + (after.levelBands - before.levelBands) * 20
                + (after.coreProfiles - before.coreProfiles) * 9
                + (after.routeMilestoneProfiles - before.routeMilestoneProfiles) * 5
                + (after.growthProfiles - before.growthProfiles) * 3;
            if (score > bestScore) { bestScore = score; bestIndex = index; }
        }
        const [chosen] = remaining.splice(bestIndex, 1);
        selected.push(chosen);
        usedDigests.add(chosen.summaryDigest);
        for (let index = remaining.length - 1; index >= 0; index -= 1) {
            if (usedDigests.has(remaining[index].summaryDigest)) remaining.splice(index, 1);
        }
    }
    const metrics = diversity(selected);
    const valid = selected.length === COHORT_COUNT && metrics.coreProfiles >= 8
        && metrics.routeMilestoneProfiles >= 6 && metrics.growthProfiles >= 6
        && metrics.ringBands >= 4 && metrics.levelBands >= 3 && metrics.closureDestinies >= 6
        && metrics.followUpClosureDestinies >= 2 && metrics.soulRingClosureDestinies >= 2
        && metrics.uniqueSummaryDigests === COHORT_COUNT;
    if (!valid) fail("No-Go / cohort insufficient", { completedCount: completed.length, selectedCount: selected.length, diversity: metrics });
    return { selected, metrics };
}

function destinyRecord(record, id) {
    const shortSoulName = (record.primaryMartialSoul?.name ?? "未知武魂").replace(/（.*$/u, "").replace(/\(.*$/u, "").trim().slice(0, 24) || "未知武魂";
    return {
        id,
        seed: record.seed,
        title: `命运 ${record.seed.slice(-3)} · ${shortSoulName}`,
        summary: `正式验证命运 · ${record.routeSummary.split(":")[0]}路线 · ${record.soulRingCount}枚魂环`,
        schemaVersion: V05_DESTINY_COHORT_SCHEMA,
        packageVersion: PACKAGE_VERSION,
        appVersion: V05_APP_VERSION,
        endpointAge: V05_ENDPOINT_AGE,
        level: record.level,
        committedCount: record.committedCount,
        randomCursor: record.randomCursor,
        finalFlowId: record.currentFlowId,
        transcriptDigest: record.transcriptDigest,
        characterDigest: record.characterDigest,
        summaryDigest: record.summaryDigest,
        primaryMartialSoul: record.primaryMartialSoul,
        soulRingCount: record.soulRingCount,
        soulBoneCount: record.soulBoneCount,
        routeSummary: record.routeSummary,
        milestoneIds: record.milestoneIds,
        milestoneTrail: record.milestoneTrail,
        pathSignature: record.pathSignature,
        routeFacets: record.routeFacets,
        closureTags: record.closureTags,
        ringBand: record.ringBand,
        levelBand: record.levelBand,
        growthProfile: record.growthProfile,
        routeMilestoneProfile: record.routeMilestoneProfile,
        coverageTags: record.coverageTags
    };
}

const day22 = loadDay22Baseline();
const runtime = materializeRuntime();
const candidateSeeds = Array.from({ length: CANDIDATE_COUNT }, (_, index) => `v05-destiny-${String(index).padStart(3, "0")}`);
const coverage = candidateSeeds.map((seed, index) => scanSeed(runtime, seed, index < 256 ? day22.coverage[index] : null));
const regressions = ["apk-route-demo-seed", "v05-custom-1"].map(seed => scanSeed(runtime, seed));
const completed = coverage.filter(record => record.status === "completed" && record.age === V05_ENDPOINT_AGE);
const completedFirst256 = completed.filter(record => Number(record.seed.slice(-3)) < 256);
const targetCounts = Object.fromEntries([...TARGET_BOUNDARIES].map(code => [code, coverage.filter(record => record.errorCode === code).length]));
if (completedFirst256.length < 100 || completed.length < 180 || Object.values(targetCounts).some(count => count !== 0)) {
    fail("No-Go / Day23 coverage gate failed", {
        completedFirst256: completedFirst256.length,
        completed512: completed.length,
        targetCounts,
        distribution: Object.fromEntries([...coverage.reduce((map, record) => map.set(`${record.status}:${record.errorCode ?? "none"}:${record.operationId ?? "none"}`,
            (map.get(`${record.status}:${record.errorCode ?? "none"}:${record.operationId ?? "none"}`) ?? 0) + 1), new Map())].sort())
    });
}
const { selected, metrics } = selectCohort(completed, day22.destinies);
const oldSelected = selected.slice(0, DAY22_COUNT);
const newSelected = selected.slice(DAY22_COUNT).sort((a, b) => a.seed.localeCompare(b.seed));
const orderedSelected = [...oldSelected, ...newSelected];
const distribution = Object.fromEntries([...coverage.reduce((counts, record) => {
    const key = `${record.status}:${record.errorCode ?? "none"}:${record.operationId ?? "none"}`;
    counts.set(key, (counts.get(key) ?? 0) + 1); return counts;
}, new Map())].sort(([a], [b]) => a.localeCompare(b)));
const beforeDistribution = Object.fromEntries([...day22.coverage.reduce((counts, record) => {
    const key = `${record.status}:${record.errorCode ?? "none"}:${record.operationId ?? "none"}`;
    counts.set(key, (counts.get(key) ?? 0) + 1); return counts;
}, new Map())].sort(([a], [b]) => a.localeCompare(b)));

const manifest = {
    schemaVersion: V05_DESTINY_COHORT_SCHEMA,
    packageVersion: PACKAGE_VERSION,
    appVersion: V05_APP_VERSION,
    status: "deterministically-verified",
    endpointAge: V05_ENDPOINT_AGE,
    candidateDomain: { first: candidateSeeds[0], last: candidateSeeds.at(-1), count: candidateSeeds.length, safetyCeiling: SAFETY_CEILING },
    day22Baseline: { candidateCount: 256, officialCount: 12, distribution: beforeDistribution,
        digest: digestV05Value(day22.coverage) },
    diversity: {
        minimumCoreProfiles: 8, minimumRouteMilestoneProfiles: 6, minimumGrowthProfiles: 6,
        minimumRingBands: 4, minimumLevelBands: 3, minimumClosureDestinies: 6,
        minimumFollowUpClosureDestinies: 2, minimumSoulRingClosureDestinies: 2, ...metrics
    },
    distribution,
    beforeAfter: {
        first256CompletedBefore: day22.coverage.filter(record => record.status === "completed").length,
        first256CompletedAfter: completedFirst256.length,
        completed512: completed.length,
        rescuedFirst256: coverage.slice(0, 256).filter(record => record.rescuedFromBoundary).length,
        targetBoundaryCounts: targetCounts
    },
    regressions,
    coverage,
    destinies: orderedSelected.map((record, index) => destinyRecord(record, `official-destiny-${String(index + 1).padStart(2, "0")}`)),
    generatedBy: "outputs/parallel-prep-2026-08-16/generate-v05-destiny-cohort.mjs"
};

validateV05DestinyManifest(manifest);
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const target = absolute(OUTPUT_PATH);
if (CHECK_ONLY) {
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== serialized) fail(`Generated destiny cohort is stale: ${OUTPUT_PATH}`);
} else fs.writeFileSync(target, serialized, "utf8");
process.stdout.write(`${JSON.stringify({ status: "pass", mode: CHECK_ONLY ? "check" : "write",
    candidateCount: coverage.length, completedFirst256: completedFirst256.length, completedCount: completed.length,
    cohortCount: orderedSelected.length, diversity: metrics, beforeAfter: manifest.beforeAfter,
    distribution, regressions: regressions.map(record => ({ seed: record.seed, status: record.status,
        age: record.age, committedCount: record.committedCount, randomCursor: record.randomCursor, errorCode: record.errorCode })) }, null, 2)}\n`);
