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
import {
    digestV05Value
} from "../../js/v05-save-store.js";
import { snapshotV05Character } from "../../js/v05-life-presentation.js";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");
const OUTPUT_PATH = "data/v05-rc/supported-destinies.json";
const CATALOG_ROOT = "data/apk-canonical/catalogs";
const PACKAGE_VERSION = "v05-rc2/2026-08-29";
const SAFETY_CEILING = 512;
const MINIMUM_COHORT = 12;

function fail(message, details = null) {
    const suffix = details ? `\n${JSON.stringify(details, null, 2)}` : "";
    throw new Error(`${message}${suffix}`);
}

function absolute(relativePath) {
    return path.join(ROOT, ...relativePath.split("/"));
}

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

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
        humanSoulRingSpeciesEvidence: readJson(`${CATALOG_ROOT}/human-soul-ring-species-runtime-evidence.json`),
        officialBeastElementEvidence: readJson(`${CATALOG_ROOT}/official-beast-element-runtime-evidence.json`),
        combatPowerEvidence: readJson(`${CATALOG_ROOT}/combat-power-runtime-evidence.json`)
    };
    return { routeGraph, contentIndex: createV05ContentIndex(loaded) };
}

function transcript(runner) {
    return runner.session.routeHistory.map(({ flowId, poolId, optionId }) => ({
        flowId,
        poolId,
        optionId
    }));
}

function milestoneIds(runner) {
    const seen = new Set();
    const ids = [];
    for (const label of runner.presentationHistory.flatMap(record => record.changeLabels ?? [])) {
        const id = `milestone-${digestV05Value(label).slice(-8)}`;
        if (!seen.has(id)) {
            seen.add(id);
            ids.push(id);
        }
    }
    return ids.sort();
}

function routeSummary(runner) {
    const character = runner.session.character;
    const route = character.route ?? "unknown";
    const faction = character.faction?.optionId ?? character.faction?.text ?? "independent";
    const talent = character.talentProgression?.talentGrade ?? "ungraded";
    return `${route}:${faction}:${talent}`;
}

function summaryPayload(runner) {
    const character = runner.session.character;
    const martialSouls = character.martialSouls ?? [];
    const soulRingCount = martialSouls.reduce((count, soul) => count + (soul.rings?.length ?? 0), 0);
    const milestones = milestoneIds(runner);
    const primary = martialSouls[0] ?? null;
    const level = character.level ?? null;
    const route = routeSummary(runner);
    const growthProfile = `${Number(level) >= 90 ? "titled" : Number(level) >= 60 ? "advanced" : "growing"}:rings-${soulRingCount}:souls-${martialSouls.length}`;
    const routeMilestoneProfile = `${route}:${milestones.slice(0, 3).join("+") || "none"}`;
    return {
        primaryMartialSoul: primary ? {
            id: primary.id ?? null,
            name: primary.name ?? primary.id ?? "未命名武魂",
            category: primary.category ?? null
        } : null,
        soulRingCount,
        routeSummary: route,
        milestoneIds: milestones,
        coreProfile: primary?.id ?? primary?.name ?? `route:${character.route ?? "unknown"}`,
        routeMilestoneProfile,
        growthProfile,
        coverageTags: [
            `core:${primary?.id ?? primary?.name ?? "none"}`,
            `route:${route}`,
            `growth:${growthProfile}`,
            ...milestones.slice(0, 3)
        ]
    };
}

function scanSeed(runtime, seed) {
    const runner = createV05DemoRunner({ ...runtime, seed });
    let lastResult = null;
    let invariantFailure = null;
    try {
        for (let step = 0; step < SAFETY_CEILING && runner.phase === "ready"; step += 1) {
            lastResult = runner.step();
        }
    } catch (error) {
        invariantFailure = error;
    }
    let status = runner.phase;
    if (invariantFailure) status = "invariant-failure";
    else if (runner.phase === "ready") status = "safety-ceiling";
    else if (runner.phase === "boundary" && (runner.session.character?.ending || runner.session.character?.death)) {
        status = "ending";
    }
    const profile = summaryPayload(runner);
    const endpoint = runner.summary ?? {
        seed,
        age: runner.session.character?.age ?? null,
        level: runner.session.character?.level ?? null,
        route: runner.session.character?.route ?? null,
        error: runner.error ?? null
    };
    const record = {
        seed,
        status,
        age: runner.session.character?.age ?? null,
        level: runner.session.character?.level ?? null,
        committedCount: runner.session.history.length,
        randomCursor: runner.session.random.cursor,
        historyCount: runner.session.history.length,
        routeHistoryCount: runner.session.routeHistory.length,
        currentFlowId: runner.session.currentFlowId,
        lastOptionId: runner.lastSpin?.optionId ?? null,
        errorCode: invariantFailure?.code ?? runner.error?.code ?? null,
        operationId: invariantFailure?.details?.operationId ?? runner.error?.details?.operationId ?? null,
        primaryMartialSoul: profile.primaryMartialSoul,
        soulRingCount: profile.soulRingCount,
        routeSummary: profile.routeSummary,
        milestoneIds: profile.milestoneIds,
        coreProfile: profile.coreProfile,
        routeMilestoneProfile: profile.routeMilestoneProfile,
        growthProfile: profile.growthProfile,
        coverageTags: profile.coverageTags,
        transcriptDigest: digestV05Value(transcript(runner)),
        characterDigest: digestV05Value(snapshotV05Character(runner.session.character)),
        summaryDigest: digestV05Value(endpoint),
        completionLockVerified: false
    };
    if (runner.phase === "completed") {
        const before = {
            cursor: runner.session.random.cursor,
            history: runner.session.history.length,
            routeHistory: runner.session.routeHistory.length
        };
        const extra = runner.step();
        record.completionLockVerified = extra.blocked === true
            && extra.reason === "completed"
            && runner.session.random.cursor === before.cursor
            && runner.session.history.length === before.history
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
        uniqueSummaryDigests: new Set(records.map(record => record.summaryDigest)).size
    };
}

function selectCohort(completed) {
    const unique = [];
    const digests = new Set();
    for (const record of completed) {
        if (!digests.has(record.summaryDigest)) {
            unique.push(record);
            digests.add(record.summaryDigest);
        }
    }
    const selected = [];
    const remaining = [...unique];
    while (selected.length < MINIMUM_COHORT && remaining.length > 0) {
        let bestIndex = 0;
        let bestScore = -1;
        for (let index = 0; index < remaining.length; index += 1) {
            const before = diversity(selected);
            const after = diversity([...selected, remaining[index]]);
            const score = (after.coreProfiles - before.coreProfiles) * 9
                + (after.routeMilestoneProfiles - before.routeMilestoneProfiles) * 5
                + (after.growthProfiles - before.growthProfiles) * 3;
            if (score > bestScore) {
                bestScore = score;
                bestIndex = index;
            }
        }
        selected.push(remaining.splice(bestIndex, 1)[0]);
    }
    const metrics = diversity(selected);
    if (selected.length < MINIMUM_COHORT
        || metrics.coreProfiles < 4
        || metrics.routeMilestoneProfiles < 3
        || metrics.growthProfiles < 3
        || metrics.uniqueSummaryDigests !== selected.length) {
        fail("No-Go / cohort insufficient", {
            completedCount: completed.length,
            selectedCount: selected.length,
            diversity: metrics
        });
    }
    return { selected: selected.sort((a, b) => a.seed.localeCompare(b.seed)), metrics };
}

function destinyRecord(record, index) {
    const soulName = record.primaryMartialSoul?.name ?? "未知武魂";
    const shortSoulName = soulName
        .replace(/（.*$/u, "")
        .replace(/\(.*$/u, "")
        .trim()
        .slice(0, 24) || "未知武魂";
    return {
        id: `official-destiny-${String(index + 1).padStart(2, "0")}`,
        seed: record.seed,
        title: `命运 ${record.seed.slice(-3)} · ${shortSoulName}`,
        summary: `正式验证命运 · ${record.routeSummary.split(":")[0]}路线 · ${record.soulRingCount}枚魂环`,
        schemaVersion: V05_DESTINY_COHORT_SCHEMA,
        packageVersion: PACKAGE_VERSION,
        appVersion: V05_APP_VERSION,
        endpointAge: V05_ENDPOINT_AGE,
        committedCount: record.committedCount,
        randomCursor: record.randomCursor,
        finalFlowId: record.currentFlowId,
        transcriptDigest: record.transcriptDigest,
        characterDigest: record.characterDigest,
        summaryDigest: record.summaryDigest,
        primaryMartialSoul: record.primaryMartialSoul,
        soulRingCount: record.soulRingCount,
        routeSummary: record.routeSummary,
        milestoneIds: record.milestoneIds,
        coverageTags: record.coverageTags
    };
}

const runtime = materializeRuntime();
const candidateSeeds = Array.from({ length: 256 }, (_, index) => (
    `v05-destiny-${String(index).padStart(3, "0")}`
));
const coverage = candidateSeeds.map(seed => scanSeed(runtime, seed));
const regressions = ["apk-route-demo-seed", "v05-custom-1"].map(seed => scanSeed(runtime, seed));
const completed = coverage.filter(record => record.status === "completed" && record.age === V05_ENDPOINT_AGE);
const { selected, metrics } = selectCohort(completed);
const distribution = Object.fromEntries([...coverage.reduce((counts, record) => {
    const key = `${record.status}:${record.errorCode ?? "none"}:${record.operationId ?? "none"}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
}, new Map())].sort(([a], [b]) => a.localeCompare(b)));

const manifest = {
    schemaVersion: V05_DESTINY_COHORT_SCHEMA,
    packageVersion: PACKAGE_VERSION,
    appVersion: V05_APP_VERSION,
    status: "deterministically-verified",
    endpointAge: V05_ENDPOINT_AGE,
    candidateDomain: {
        first: candidateSeeds[0],
        last: candidateSeeds.at(-1),
        count: candidateSeeds.length,
        safetyCeiling: SAFETY_CEILING
    },
    diversity: {
        minimumCoreProfiles: 4,
        minimumRouteMilestoneProfiles: 3,
        minimumGrowthProfiles: 3,
        ...metrics
    },
    distribution,
    regressions,
    coverage,
    destinies: selected.map(destinyRecord),
    generatedBy: "outputs/parallel-prep-2026-08-16/generate-v05-destiny-cohort.mjs"
};

validateV05DestinyManifest(manifest);
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const target = absolute(OUTPUT_PATH);
if (CHECK_ONLY) {
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== serialized) {
        fail(`Generated destiny cohort is stale: ${OUTPUT_PATH}`);
    }
} else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, serialized, "utf8");
}

process.stdout.write(`${JSON.stringify({
    status: "pass",
    mode: CHECK_ONLY ? "check" : "write",
    candidateCount: coverage.length,
    completedCount: completed.length,
    cohortCount: selected.length,
    diversity: metrics,
    distribution,
    regressions: regressions.map(record => ({
        seed: record.seed,
        status: record.status,
        age: record.age,
        committedCount: record.committedCount,
        randomCursor: record.randomCursor,
        errorCode: record.errorCode
    }))
}, null, 2)}\n`);
