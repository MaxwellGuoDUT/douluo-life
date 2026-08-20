export const APK_SCHEDULER_RUNTIME_VERSION = "apk-scheduler-runtime/1.0";

const FORMAL_SOURCE_PREFIX = "douluo1:flow.formal-source.";
const FORMAL_STORY_PREFIX = "douluo1:flow.formal-story.";
const FORMAL_SCHEDULER_FLOW = "douluo1:flow.formal-human.scheduler";
const FORMAL_OFFICIAL_BEAST_FLOW =
    "douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577";
const FORMAL_SPECIAL_GROWTH_FLOW = "douluo1:flow.formal-special-growth";
const FORMAL_COMPLETE_FLOW = "douluo1:flow.formal-human.complete";
const FORMAL_DOMAIN_POOL_ID = "13e60019-9d99-411a-8739-65d3d1eb13bd";
const FORMAL_GOD_TRIAL_DRAWS = "formal:god-trial-draws";
const FORMAL_ELEMENT_DRAWS = "formal:element-draws";
const FORMAL_DOMAIN_DRAWS = "formal:domain-draws";
const FORMAL_SCHEDULER_MODE = "formal:d1-scheduler-mode";
const FORMAL_SCHEDULER_INDEX = "formal:d1-scheduler-index";
const FORMAL_GOD_TRIAL_RETURN_STEP = "godTrialReturnStep";
const FORMAL_STORY_COMPLETE = "formal:d1-story:complete";
const FORMAL_STORY_FREE_MODE = "formal:d1-story:free-mode";
const HUMAN_LIFESPAN = 150;

const ANNUAL_SOURCE_POOLS = Object.freeze({
    F: "5fc640cc-8030-4f30-8e77-ed41c3bf6ab0",
    E: "5fc640cc-8030-4f30-8e77-ed41c3bf6ab0",
    D: "63b90f87-37fc-4c1d-b87b-0d75f1553f6a",
    C: "c9944ade-310d-41eb-b8ea-01723cab952c",
    B: "91f2c399-9035-4f38-9e94-f29e9e5e0892",
    A: "8dbe8ae4-d962-4361-95a2-12c51192886a",
    S: "1c229edc-e0c7-4279-8ad5-ccbb918a6449",
    divine: "3a00b61e-7668-4eb7-97b7-5a6f5c098cff"
});

const STORY_BRANCH_1_TIMELINES = Object.freeze([
    6, 6, 12, 12, 12, 12, 13, 14, 14, 14, 14, 14, 14, 16, 16, 16,
    16, 16, 16, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25
]);

const STORY_BRANCH_2_TIMELINES = Object.freeze([
    14, 14, 14, 16, 16, 16, 16, 16, 16, 19, 19, 20, 20, 20, 20, 20, 20,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25
]);

const STORY_BRANCH_1_POOLS = Object.freeze([
    "25ba2bd3-6aef-4215-a4a0-78fca1a8e80b",
    "e28cc540-e2b9-46ad-80be-d63ddf266d21",
    "10584e98-53ce-46c4-9a9b-04e71ef5cb1e",
    "ca55a353-ed56-4577-8292-898b2c3f86bb",
    "595ea081-03e4-4c27-9275-8b6aa6097f41",
    "c0aa0c4a-08c8-4258-aafd-d7418465bfbf",
    "9aac8c0e-679d-4d2c-9982-aa30b4b60835",
    "3c298741-3755-4811-ba03-ee33791b5f17",
    "b25f7889-cd31-4e3c-b3b1-db4128faca82",
    "8f0d4486-1db4-415b-81e8-9193a23c6582",
    "08870a91-6bb2-4c2e-9ae9-803b040261c2",
    "45611dcd-bf4f-4090-bb28-988cf943caa6",
    "90f222ec-5eeb-43d4-a3c6-802832241b35",
    "a793c702-f1f0-41ed-92cb-020efba8766b",
    "31e061bb-3cfe-4202-8122-5543028a02f9",
    "945a786b-7acf-42c5-93ac-b3d50000eb45",
    "68b250f8-6775-4b14-91df-6791f6a6495c",
    "883dbe12-f8b2-4dd7-8f3e-6704fbded6e4",
    "ecc7ebc8-6e89-41d9-a7c9-ed7ed103c478",
    "6cbb15b9-1a87-478d-aee9-5f7fb56e614b",
    "d3b4c11b-9695-4601-8ff7-caf3fba5d7c9",
    "6a8acef4-7be1-4fd8-beaf-996fd323b13f",
    "36beacf7-d2fb-4060-a18f-653279a8bd6f",
    "cdda8c55-187a-4c14-b81f-9bd5772f4246",
    "c21b536f-b51b-4b9c-8652-986526446711",
    "20084e12-0625-4bb3-9d72-310e5c04af8c",
    "a7f7be8c-a3f7-484e-85de-9c402f2e8b01",
    "ad298544-3fdb-434e-b15e-c09763204fb8",
    "8c4f9874-bda6-4751-97d7-ae73a6c0cd58",
    "e05f293d-e2cd-4e78-ab58-6e15f3271015",
    "73d21381-4efe-4aa7-85a6-a202f045feb9",
    "8d6601fc-15e8-4b82-8118-ee7b933c89ca",
    "a45e8014-7f90-4e85-9c7e-eaac7c598b45",
    "45dce3f7-0e65-4367-b2d5-2122bb680cec",
    "a497fe0d-6d77-429c-9881-86a8af9ff50c",
    "47e138c5-fbce-430e-a30f-85644f378597",
    "0dff68cc-572a-4eeb-8b10-e022817b1713",
    "d2e4500f-2adf-434a-8fdd-83bcafa24ab4",
    "b9ce21e3-429a-4f8f-a90f-fb9f0f43698f",
    "51254ed4-e44b-4ed4-987d-7572a6c126bd",
    "d9ba0a72-6197-4cd9-83ed-93c73d4557ca",
    "fc6da9ae-089f-4df7-8f16-a75999094c2e",
    "4cefc71e-ebfa-4e24-8907-66db7f31ab8e"
]);

const STORY_BRANCH_2_POOLS = Object.freeze([
    "e86c0163-ccdc-4a71-a4a7-ed802953e5e0",
    "7944f1f3-01e5-4380-8593-6e4aa6ab7736",
    "d2dd6165-1307-4760-abdc-6c4aec9a78a8",
    "89a5294a-dbb0-42bd-8696-f2c58e55e119",
    "aae89744-fda2-4495-a85d-6d06bbbbec35",
    "e6c819f9-8092-4273-8ffa-2c59f049ee72",
    "add8687c-d56b-441a-8300-04b7e3a26d74",
    "526f87c8-a50d-44fe-a522-db774c3da49d",
    "0881e67a-ac71-4b62-886c-d12f5e5da65a",
    "8299b8fe-1ec7-4d1e-b280-4c7b9b11e914",
    "a4e873c1-9c2c-4d02-98cb-20bcd4bf6572",
    "7f551e6b-a520-47b1-bc07-fa5ab6932aa8",
    "3f313b31-a91e-44fc-9094-c9ef2163d3b4",
    "23b3b2b4-38dd-472e-b1b6-61cae919fc59",
    "7338cb8b-3071-49f4-83ac-f12b9ffd1778",
    "35781dd8-f671-4c63-b1f0-1b19a2ce3dc1",
    "5ea25641-f5c6-4f59-90bd-364a6bcbba61",
    "74b2cc1e-8db2-45ba-8df4-1ba9347a813b",
    "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
    "002514ad-254b-4f64-a1f4-8baf7aea8b4a",
    "f8eefa08-7bf0-4600-a25e-2fcbe85971b0",
    "1730b639-0910-4c98-96aa-a9fbed203344",
    "4a9425bc-dc67-4d93-bd99-c7d4513e9e63",
    "920deb55-5528-40fd-9f18-a2719ad52ef8",
    "52d77fdc-3a7a-4959-a49b-86381868a202",
    "23f98f6f-73cd-4e9b-8c38-29ceab746fea",
    "bbd711e9-fa95-47c1-856c-362dc34c0531",
    "cdae9943-fb9d-49ba-853c-40d9b78924ae",
    "85c0de01-da93-4c56-bfdb-349965174e47",
    "6bc08ccf-66ac-4edb-ad88-0c71f92005b8",
    "6f1ac8a4-2dc9-4a44-9f9f-919a71257b12",
    "1209bb56-d533-48af-b012-204292b96f68"
]);

const STORY_PREREQUISITES = Object.freeze({
    "e28cc540-e2b9-46ad-80be-d63ddf266d21": {
        poolId: "25ba2bd3-6aef-4215-a4a0-78fca1a8e80b",
        optionIds: ["06fc25"]
    },
    "b25f7889-cd31-4e3c-b3b1-db4128faca82": {
        poolId: "3c298741-3755-4811-ba03-ee33791b5f17",
        optionIds: ["c50aa0"]
    },
    "31e061bb-3cfe-4202-8122-5543028a02f9": {
        poolId: "a793c702-f1f0-41ed-92cb-020efba8766b",
        optionIds: ["3211dc"]
    },
    "945a786b-7acf-42c5-93ac-b3d50000eb45": {
        poolId: "a793c702-f1f0-41ed-92cb-020efba8766b",
        optionIds: ["3211dc"]
    },
    "68b250f8-6775-4b14-91df-6791f6a6495c": {
        poolId: "a793c702-f1f0-41ed-92cb-020efba8766b",
        optionIds: ["3211dc"]
    },
    "883dbe12-f8b2-4dd7-8f3e-6704fbded6e4": {
        poolId: "a793c702-f1f0-41ed-92cb-020efba8766b",
        optionIds: ["3211dc"]
    },
    "ecc7ebc8-6e89-41d9-a7c9-ed7ed103c478": {
        poolId: "a793c702-f1f0-41ed-92cb-020efba8766b",
        optionIds: ["3211dc"]
    },
    "d3b4c11b-9695-4601-8ff7-caf3fba5d7c9": {
        poolId: "6cbb15b9-1a87-478d-aee9-5f7fb56e614b",
        optionIds: ["ed092b"]
    },
    "36beacf7-d2fb-4060-a18f-653279a8bd6f": {
        poolId: "6a8acef4-7be1-4fd8-beaf-996fd323b13f",
        optionIds: ["26ece5"]
    },
    "cdda8c55-187a-4c14-b81f-9bd5772f4246": {
        poolId: "36beacf7-d2fb-4060-a18f-653279a8bd6f",
        optionIds: ["fc38d0"]
    },
    "c21b536f-b51b-4b9c-8652-986526446711": {
        poolId: "36beacf7-d2fb-4060-a18f-653279a8bd6f",
        optionIds: ["72b914", "f95c11", "be0b8e"]
    },
    "8c4f9874-bda6-4751-97d7-ae73a6c0cd58": {
        poolId: "ad298544-3fdb-434e-b15e-c09763204fb8",
        optionIds: ["494eac"]
    },
    "e05f293d-e2cd-4e78-ab58-6e15f3271015": {
        poolId: "ad298544-3fdb-434e-b15e-c09763204fb8",
        optionIds: ["494eac"]
    },
    "8d6601fc-15e8-4b82-8118-ee7b933c89ca": {
        poolId: "73d21381-4efe-4aa7-85a6-a202f045feb9",
        optionIds: ["26f190"]
    },
    "a45e8014-7f90-4e85-9c7e-eaac7c598b45": {
        poolId: "73d21381-4efe-4aa7-85a6-a202f045feb9",
        optionIds: ["9757ee"]
    },
    "45dce3f7-0e65-4367-b2d5-2122bb680cec": {
        poolId: "73d21381-4efe-4aa7-85a6-a202f045feb9",
        optionIds: ["ca9747"]
    },
    "a497fe0d-6d77-429c-9881-86a8af9ff50c": {
        poolId: "73d21381-4efe-4aa7-85a6-a202f045feb9",
        optionIds: ["ef7664"]
    },
    "47e138c5-fbce-430e-a30f-85644f378597": {
        poolId: "73d21381-4efe-4aa7-85a6-a202f045feb9",
        optionIds: ["156fe0"]
    },
    "0dff68cc-572a-4eeb-8b10-e022817b1713": {
        poolId: "73d21381-4efe-4aa7-85a6-a202f045feb9",
        optionIds: ["3a5fb1"]
    },
    "b9ce21e3-429a-4f8f-a90f-fb9f0f43698f": {
        poolId: "ad298544-3fdb-434e-b15e-c09763204fb8",
        optionIds: ["494eac"]
    },
    "d9ba0a72-6197-4cd9-83ed-93c73d4557ca": {
        poolId: "51254ed4-e44b-4ed4-987d-7572a6c126bd",
        optionIds: ["c1522b"]
    },
    "fc6da9ae-089f-4df7-8f16-a75999094c2e": {
        poolId: "51254ed4-e44b-4ed4-987d-7572a6c126bd",
        optionIds: ["c1522b"]
    },
    "7944f1f3-01e5-4380-8593-6e4aa6ab7736": {
        poolId: "e86c0163-ccdc-4a71-a4a7-ed802953e5e0",
        optionIds: ["7875c3"]
    },
    "d2dd6165-1307-4760-abdc-6c4aec9a78a8": {
        poolId: "e86c0163-ccdc-4a71-a4a7-ed802953e5e0",
        optionIds: ["7875c3"]
    },
    "aae89744-fda2-4495-a85d-6d06bbbbec35": {
        poolId: "89a5294a-dbb0-42bd-8696-f2c58e55e119",
        optionIds: ["b7e194"]
    },
    "e6c819f9-8092-4273-8ffa-2c59f049ee72": {
        poolId: "89a5294a-dbb0-42bd-8696-f2c58e55e119",
        optionIds: ["b7e194"]
    },
    "add8687c-d56b-441a-8300-04b7e3a26d74": {
        poolId: "89a5294a-dbb0-42bd-8696-f2c58e55e119",
        optionIds: ["b7e194"]
    },
    "526f87c8-a50d-44fe-a522-db774c3da49d": {
        poolId: "89a5294a-dbb0-42bd-8696-f2c58e55e119",
        optionIds: ["b7e194"]
    },
    "0881e67a-ac71-4b62-886c-d12f5e5da65a": {
        poolId: "89a5294a-dbb0-42bd-8696-f2c58e55e119",
        optionIds: ["b7e194"]
    },
    "a4e873c1-9c2c-4d02-98cb-20bcd4bf6572": {
        poolId: "8299b8fe-1ec7-4d1e-b280-4c7b9b11e914",
        optionIds: ["90a6d5"]
    },
    "3f313b31-a91e-44fc-9094-c9ef2163d3b4": {
        poolId: "7f551e6b-a520-47b1-bc07-fa5ab6932aa8",
        optionIds: ["013f1a"]
    },
    "7338cb8b-3071-49f4-83ac-f12b9ffd1778": {
        poolId: "23b3b2b4-38dd-472e-b1b6-61cae919fc59",
        optionIds: ["3d9984"]
    },
    "5ea25641-f5c6-4f59-90bd-364a6bcbba61": {
        poolId: "35781dd8-f671-4c63-b1f0-1b19a2ce3dc1",
        optionIds: ["a13b28"]
    },
    "bef12ebe-38b9-41a0-9d17-70a563a4fe4a": {
        poolId: "74b2cc1e-8db2-45ba-8df4-1ba9347a813b",
        optionIds: ["12e609", "41845b"]
    },
    "002514ad-254b-4f64-a1f4-8baf7aea8b4a": {
        poolId: "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
        optionIds: ["ec7fdb"]
    },
    "f8eefa08-7bf0-4600-a25e-2fcbe85971b0": {
        poolId: "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
        optionIds: ["b2b2af"]
    },
    "1730b639-0910-4c98-96aa-a9fbed203344": {
        poolId: "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
        optionIds: ["8375e5"]
    },
    "4a9425bc-dc67-4d93-bd99-c7d4513e9e63": {
        poolId: "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
        optionIds: ["1af6b6"]
    },
    "920deb55-5528-40fd-9f18-a2719ad52ef8": {
        poolId: "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
        optionIds: ["3e44d6"]
    },
    "52d77fdc-3a7a-4959-a49b-86381868a202": {
        poolId: "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
        optionIds: ["03a8aa"]
    },
    "23f98f6f-73cd-4e9b-8c38-29ceab746fea": {
        poolId: "bef12ebe-38b9-41a0-9d17-70a563a4fe4a",
        optionIds: ["2fecee"]
    },
    "85c0de01-da93-4c56-bfdb-349965174e47": {
        poolId: "cdae9943-fb9d-49ba-853c-40d9b78924ae",
        optionIds: ["ffc783"]
    },
    "6bc08ccf-66ac-4edb-ad88-0c71f92005b8": {
        poolId: "cdae9943-fb9d-49ba-853c-40d9b78924ae",
        optionIds: ["ffc783"]
    },
    "6f1ac8a4-2dc9-4a44-9f9f-919a71257b12": {
        poolId: "cdae9943-fb9d-49ba-853c-40d9b78924ae",
        optionIds: ["ffc783"]
    },
    "1209bb56-d533-48af-b012-204292b96f68": {
        poolId: "cdae9943-fb9d-49ba-853c-40d9b78924ae",
        optionIds: ["403ea3"]
    }
});

const DOMAIN_NAMES = Object.freeze([
    "蓝银领域", "杀神领域", "天使领域", "罗刹领域", "修罗领域", "生命领域",
    "毁灭领域", "雷神领域", "火神领域", "海神领域", "风神领域", "冰神领域",
    "龙神领域", "剑神领域", "刀神领域", "弓神领域", "战神领域", "蝶神领域",
    "斗神领域", "月神领域", "日神领域", "死神领域", "人神领域", "魔神领域",
    "恶魔领域", "力神领域", "速神领域", "凤凰领域"
]);

function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function flagNumber(character, key) {
    const value = Number(character?.flags?.[key] ?? 0);
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function storyEntries(character) {
    if (character?.storyBranch === 1) {
        return STORY_BRANCH_1_POOLS.map((poolId, index) => ({
            poolId,
            minimumTimelineAge: STORY_BRANCH_1_TIMELINES[index]
        }));
    }
    if (character?.storyBranch === 2) {
        return STORY_BRANCH_2_POOLS.map((poolId, index) => ({
            poolId,
            minimumTimelineAge: STORY_BRANCH_2_TIMELINES[index]
        }));
    }
    return [];
}

function storySelected(character, prerequisite) {
    return prerequisite.optionIds.some(optionId => (
        character.flags?.[`formal:d1-story:selected:${prerequisite.poolId}:${optionId}`] === true
    ));
}

function storyHasCombatWin(contentIndex, character, poolId) {
    return contentIndex.getOptions(poolId).some(option => {
        const optionId = option?.normalized?.option_id ?? option?.availability?.optionId;
        return character.flags?.[`formal:d1-story:combat:${poolId}:${optionId}`] === "win";
    });
}

function storyPoolEnabled(contentIndex, poolId) {
    return contentIndex.getPool(poolId)
        && contentIndex.getOptions(poolId).some(option => (
            option?.availability?.enabled === true
        ));
}

export function planFormalStory({ contentIndex, character } = {}) {
    const flags = character?.flags ?? {};
    if (flags[FORMAL_STORY_FREE_MODE] === true && character.age >= HUMAN_LIFESPAN) {
        return {
            kind: "terminal",
            effects: [{
                type: "ending",
                endingId: `douluo1:story:free-mode-settlement:${HUMAN_LIFESPAN}`,
                title: "自由命运的生涯结算",
                kind: "neutral"
            }]
        };
    }
    if (flags[FORMAL_STORY_FREE_MODE] === true) {
        return { kind: "none", effects: [] };
    }

    const entries = storyEntries(character);
    if (entries.length === 0) return { kind: "none", effects: [] };

    const timelineAge = character.timelineAge
        ?? character.storyTime?.tangAge
        ?? character.age;
    const effects = [];
    for (const entry of entries) {
        const completedKey = `formal:d1-story:completed:${entry.poolId}`;
        const skippedKey = `formal:d1-story:skipped:${entry.poolId}`;
        if (flags[completedKey] === true || flags[skippedKey] === true) continue;
        if (timelineAge < entry.minimumTimelineAge) {
            return { kind: "not-ready", effects };
        }

        if (!storyPoolEnabled(contentIndex, entry.poolId)) {
            effects.push({ type: "setFlag", key: skippedKey, value: true });
            continue;
        }

        const prerequisite = STORY_PREREQUISITES[entry.poolId];
        if (prerequisite && !storySelected(character, prerequisite)) {
            effects.push({ type: "setFlag", key: skippedKey, value: true });
            continue;
        }

        if (entry.poolId === "90f222ec-5eeb-43d4-a3c6-802832241b35"
            && !storyHasCombatWin(
                contentIndex,
                character,
                "45611dcd-bf4f-4090-bb28-988cf943caa6"
            )) {
            effects.push({ type: "setFlag", key: skippedKey, value: true });
            continue;
        }
        if (entry.poolId === "d2dd6165-1307-4760-abdc-6c4aec9a78a8"
            && !storyHasCombatWin(
                contentIndex,
                character,
                "7944f1f3-01e5-4380-8593-6e4aa6ab7736"
            )) {
            effects.push({ type: "setFlag", key: skippedKey, value: true });
            continue;
        }

        return {
            kind: "target",
            target: `${FORMAL_STORY_PREFIX}${entry.poolId}`,
            effects,
            poolId: entry.poolId,
            minimumTimelineAge: entry.minimumTimelineAge
        };
    }

    effects.push({ type: "setFlag", key: FORMAL_STORY_COMPLETE, value: true });
    return { kind: "complete", effects };
}

function canAttachSoulRing(character, soul) {
    return Boolean(soul)
        && !soul.passives?.includes("cannotAttachSoulRing")
        && !character.traits?.includes("innate-dao-body");
}

function firstMissingRing(soul, count) {
    const rings = Array.isArray(soul?.rings) ? soul.rings : [];
    for (let index = 0; index < count; index += 1) {
        if (!rings[index]) return index + 1;
    }
    return null;
}

function prepareSoulRingEffects(soulIndex, ringIndex) {
    return [{ type: "prepareHumanSoulRing", soulIndex, ringIndex }];
}

function planSecondarySoulRingBatch(character) {
    const candidates = [];
    const completionEffects = [];
    for (let soulIndex = 1; soulIndex < (character.martialSouls ?? []).length; soulIndex += 1) {
        const soul = character.martialSouls[soulIndex];
        if (!canAttachSoulRing(character, soul)) continue;
        const missing = firstMissingRing(soul, 9);
        const completionKey = soulIndex === 1
            ? "secondarySoulRingsCompleted"
            : soulIndex === 2
                ? "tertiarySoulRingsCompleted"
                : null;
        if (completionKey) {
            completionEffects.push({
                type: missing === null ? "setFlag" : "deleteFlag",
                key: completionKey,
                ...(missing === null ? { value: true } : {})
            });
        }
        if (missing !== null) candidates.push(soulIndex);
    }

    const currentBatch = Array.isArray(character.additionalSoulRingBatch)
        ? character.additionalSoulRingBatch
        : [];
    const candidateSet = new Set(candidates);
    const selected = currentBatch.length > 0
        ? [...new Set(currentBatch)].filter(index => candidateSet.has(index))
        : candidates;
    if (selected.length === 0) {
        return {
            target: null,
            effects: [
                ...completionEffects,
                { type: "setAdditionalSoulRingBatch", value: null }
            ]
        };
    }

    const soulIndex = selected[0];
    const ringIndex = firstMissingRing(character.martialSouls[soulIndex], 9);
    return {
        target: "humanSecondaryRingAge",
        effects: [
            ...completionEffects,
            { type: "setAdditionalSoulRingBatch", value: selected },
            ...prepareSoulRingEffects(soulIndex, ringIndex)
        ]
    };
}

function planSoulRing(character) {
    if (character.flags?.noSoulPower === true) return { target: null, effects: [] };
    const level = Math.trunc(Number(character.level) || 0);
    if (level >= 90
        && Array.isArray(character.additionalSoulRingBatch)
        && character.additionalSoulRingBatch.length > 0) {
        return planSecondarySoulRingBatch(character);
    }

    const primarySoul = character.martialSouls?.[0];
    if (canAttachSoulRing(character, primarySoul)) {
        const targetCount = Math.min(9, Math.max(0, Math.floor(level / 10)));
        const ringIndex = firstMissingRing(primarySoul, targetCount);
        if (ringIndex !== null) {
            return {
                target: `humanPrimaryRingAge${ringIndex}`,
                effects: prepareSoulRingEffects(0, ringIndex)
            };
        }
    }

    if (level < 90) {
        return {
            target: null,
            effects: Array.isArray(character.additionalSoulRingBatch)
                ? [{ type: "setAdditionalSoulRingBatch", value: null }]
                : []
        };
    }
    return planSecondarySoulRingBatch(character);
}

function hasMissingDomain(character) {
    return DOMAIN_NAMES.some(domain => !(character.domains ?? []).includes(domain));
}

function sourceFlow(poolId) {
    return `${FORMAL_SOURCE_PREFIX}${poolId}`;
}

function annualFlow(contentIndex, character) {
    const grade = character.talentProgression?.talentGrade ?? "E";
    const poolId = character.level >= 100
        ? "2d5370b6-167b-45ea-8c94-da653a0e837c"
        : character.level >= 90
            ? "190cf048-8c66-436a-8fb3-08b34e003059"
            : (ANNUAL_SOURCE_POOLS[grade] ?? ANNUAL_SOURCE_POOLS.E);
    return sourceFlow(poolId);
}

function setSchedulerMode(mode, index = 0) {
    return [
        { type: "setFlag", key: FORMAL_SCHEDULER_MODE, value: mode },
        { type: "setFlag", key: FORMAL_SCHEDULER_INDEX, value: index }
    ];
}

export function planFormalHumanScheduler({ contentIndex, session } = {}) {
    if (contentIndex?.packId !== "douluo1") return null;
    const character = session.character;
    const flags = character.flags ?? {};
    const effects = [];

    if (character.route !== "beast" && character.age >= HUMAN_LIFESPAN) {
        return {
            terminal: true,
            effects: [{
                type: "ending",
                endingId: "douluo1:human-lifespan-150",
                title: "百五十岁人生圆满结算",
                kind: "success"
            }],
            reason: "formal-human-lifespan"
        };
    }

    if (session.pendingSoulBone) {
        return { target: "humanPrepareSoulBonePart", effects, reason: "pending-soul-bone" };
    }

    if (flagNumber(character, FORMAL_ELEMENT_DRAWS) > 0) {
        return {
            target: FORMAL_OFFICIAL_BEAST_FLOW,
            effects: [{ type: "changeCounter", key: FORMAL_ELEMENT_DRAWS, amount: -1 }],
            reason: "element-draw"
        };
    }

    if (flagNumber(character, FORMAL_DOMAIN_DRAWS) > 0 && hasMissingDomain(character)) {
        return {
            target: sourceFlow(FORMAL_DOMAIN_POOL_ID),
            effects: [{ type: "changeCounter", key: FORMAL_DOMAIN_DRAWS, amount: -1 }],
            reason: "domain-draw"
        };
    }

    const godTrialStatus = character.godTrial?.status;
    const godTrialCompleted = ["completed", "failed", "abandoned"].includes(godTrialStatus);
    if (godTrialCompleted) {
        effects.push({ type: "archiveCompletedGodTrial" });
    }
    const availableGodTrialDraw = flagNumber(character, FORMAL_GOD_TRIAL_DRAWS) > 0;
    const canStartGodTrial = availableGodTrialDraw && (
        !character.godTrial || godTrialCompleted
    );
    if (canStartGodTrial) {
        effects.push(
            { type: "changeCounter", key: FORMAL_GOD_TRIAL_DRAWS, amount: -1 },
            ...setSchedulerMode("godTrial", 0)
        );
    }

    const ringPlan = planSoulRing(character);
    if (ringPlan.target) {
        return {
            target: ringPlan.target,
            effects: [...effects, ...ringPlan.effects],
            reason: "soul-ring-planner"
        };
    }
    effects.push(...ringPlan.effects);

    const hasDomainPrototype = character.traits?.includes("domain-prototype")
        || flags.pendingDomainPrototype === true;
    if (character.level >= 90 && hasDomainPrototype) {
        effects.push(
            { type: "removeTrait", traitId: "domain-prototype" },
            { type: "deleteFlag", key: "pendingDomainPrototype" }
        );
        if (hasMissingDomain(character)) {
            return {
                target: sourceFlow(FORMAL_DOMAIN_POOL_ID),
                effects,
                reason: "domain-prototype"
            };
        }
    }

    const mode = canStartGodTrial
        ? "godTrial"
        : typeof flags[FORMAL_SCHEDULER_MODE] === "string"
        ? String(flags[FORMAL_SCHEDULER_MODE])
        : "annual";
    if (mode === "annual") {
        const storyPlan = planFormalStory({ contentIndex, character });
        if (storyPlan.kind === "terminal") {
            return {
                terminal: true,
                effects: [...effects, ...storyPlan.effects],
                reason: "formal-story-free-mode-settlement"
            };
        }
        if (storyPlan.kind === "target") {
            return {
                target: storyPlan.target,
                effects: [...effects, ...storyPlan.effects],
                reason: "formal-story-plan",
                storyPoolId: storyPlan.poolId
            };
        }

        const storyComplete = flags[FORMAL_STORY_COMPLETE] === true
            || storyPlan.kind === "complete";
        if (character.age >= HUMAN_LIFESPAN
            && (character.storyBranch === 3 || storyComplete)) {
            return {
                target: FORMAL_COMPLETE_FLOW,
                effects: [...effects, ...storyPlan.effects],
                reason: "formal-story-complete"
            };
        }
        if (character.talentProgression?.talentGrade === "F") {
            return {
                target: FORMAL_SPECIAL_GROWTH_FLOW,
                effects: [...effects, ...storyPlan.effects],
                reason: "formal-f-grade-growth"
            };
        }
        return {
            target: annualFlow(contentIndex, character),
            effects: [...effects, ...storyPlan.effects],
            reason: "formal-annual-growth"
        };
    }

    if (mode === "godTrial") {
        return {
            target: "humanGodTrialTier",
            effects: [
                ...effects,
                ...setSchedulerMode("annual", 0),
                { type: "setFlag", key: FORMAL_GOD_TRIAL_RETURN_STEP, value: FORMAL_SCHEDULER_FLOW }
            ],
            reason: "formal-god-trial-mode"
        };
    }

    if (mode === "seaTrial") {
        return {
            target: `${FORMAL_SOURCE_PREFIX}e7e646c0-8c53-4f95-b978-5bb661d57fa5`,
            effects: [...effects, ...setSchedulerMode("annual", 0)],
            reason: "formal-sea-trial-mode"
        };
    }

    return {
        target: FORMAL_COMPLETE_FLOW,
        effects,
        reason: "formal-unknown-scheduler-mode"
    };
}

export const APK_FORMAL_SCHEDULER_EVIDENCE = Object.freeze({
    sourceSha256: "E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C",
    sourceModule: "apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js",
    schedulerAction: "douluo1:action.formal-human.schedule",
    schedulerFlow: FORMAL_SCHEDULER_FLOW,
    humanLifespan: HUMAN_LIFESPAN,
    annualSourcePools: ANNUAL_SOURCE_POOLS,
    domainPoolId: FORMAL_DOMAIN_POOL_ID,
    officialElementFlow: FORMAL_OFFICIAL_BEAST_FLOW,
    specialGrowthFlow: FORMAL_SPECIAL_GROWTH_FLOW,
    completeFlow: FORMAL_COMPLETE_FLOW,
    storyBranches: {
        1: STORY_BRANCH_1_POOLS.map((poolId, index) => ({
            poolId,
            minimumTimelineAge: STORY_BRANCH_1_TIMELINES[index]
        })),
        2: STORY_BRANCH_2_POOLS.map((poolId, index) => ({
            poolId,
            minimumTimelineAge: STORY_BRANCH_2_TIMELINES[index]
        }))
    },
    storyPrerequisites: clone(STORY_PREREQUISITES),
    domainNames: [...DOMAIN_NAMES],
    gameplayExecuted: false,
    extractionMode: "static_source_mapping_only"
});

export default Object.freeze({
    APK_FORMAL_SCHEDULER_EVIDENCE,
    APK_SCHEDULER_RUNTIME_VERSION,
    planFormalHumanScheduler,
    planFormalStory
});
