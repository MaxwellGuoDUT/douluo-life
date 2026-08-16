export const APK_SPECIAL_GROWTH_RUNTIME_VERSION = "apk-special-growth-runtime/1.0";

const FORMAL_SPECIAL_GROWTH_FLOW = "douluo1:flow.formal-special-growth";
const FORMAL_SPECIAL_GROWTH_ACTION = "douluo1:action.formal-special-growth";
const SPECIAL_FLOW_PREFIX = "douluo1:flow.special.";
const SUPPRESS_ENCOUNTER_FLAG = "formal:suppress-encounter";
const IDENTITY_SUPPRESS_ENCOUNTER_FLAG = "identity:suppress-encounter-before-12";

const GROUP_TAGS = Object.freeze([
    "8b39d0c5-5e8b-45a0-b0a6-b39ef5a81d8b",
    "11d7fb01-5f12-4e22-9d0a-b47b15c464c9",
    "35846eba-27a7-412d-9008-6e8018939f29",
    "508a45c8-b1f8-4fda-a416-21dd1e93d53b",
    "390f2c83-5975-4745-aca5-dd723602228e"
]);

const IDENTITY_GROUP_TAGS = Object.freeze({
    "douluo2:identity.commoner": GROUP_TAGS[0],
    "douluo2:identity.free-soul-master": GROUP_TAGS[0],
    "douluo2:identity.sect-disciple": GROUP_TAGS[0],
    "douluo2:identity.traveler": GROUP_TAGS[1],
    "douluo2:identity.reborn": GROUP_TAGS[1],
    "douluo2:identity.child-of-fortune": GROUP_TAGS[1],
    "douluo2:identity.knight": GROUP_TAGS[2],
    "douluo2:identity.child-of-god": GROUP_TAGS[2],
    "douluo2:identity.god-reincarnation": GROUP_TAGS[2],
    "douluo2:identity.noble": GROUP_TAGS[3],
    "douluo2:identity.royal": GROUP_TAGS[3],
    "douluo2:identity.have-nothing": GROUP_TAGS[4]
});

const TOP_POOLS = Object.freeze([
    { poolId: "14384f3c-3f1e-4c0b-96a1-4f3f48df4bcc", groupTag: GROUP_TAGS[4], tier: 1 },
    { poolId: "96127132-31a6-4525-b568-2167d93a41cf", groupTag: GROUP_TAGS[4], tier: 2 },
    { poolId: "53c59de6-35f3-400d-88c7-b4fa39901aba", groupTag: GROUP_TAGS[4], tier: 3 },
    { poolId: "1a50848d-dc09-42f5-b061-307f25295ee4", groupTag: GROUP_TAGS[4], tier: 4 },
    { poolId: "729e37ce-1a8d-4703-80c1-493728ab9e26", groupTag: GROUP_TAGS[4], tier: 5 },
    { poolId: "bfaf6a71-a38c-47f9-b2df-6a6c8f56496b", groupTag: GROUP_TAGS[4], tier: 6 },
    { poolId: "0b0e3d0a-3a81-492a-94c1-885ee68aa2ef", groupTag: GROUP_TAGS[4], tier: 7 },
    { poolId: "2ad98f33-ec4e-4b6b-8e5c-c9a428757a4b", groupTag: GROUP_TAGS[4], tier: 8 },
    { poolId: "7d76cc9a-8102-43a0-888f-02d490d30657", groupTag: GROUP_TAGS[4], tier: 9 },
    { poolId: "e6b34559-8471-4d76-a75d-7609edd72fe3", groupTag: GROUP_TAGS[4], tier: 10 },
    { poolId: "af91c61a-7c8d-4ea6-9a15-c45f3f000c10", groupTag: GROUP_TAGS[4], tier: 11 },
    { poolId: "6e84eb29-f1e6-438d-a3f3-27ae21f39001", groupTag: GROUP_TAGS[4], tier: 12 },
    { poolId: "e9ca21df-92f7-465a-bce2-2fbc996040f6", groupTag: GROUP_TAGS[0], tier: 1 },
    { poolId: "4ea3bb33-e7d9-4340-bf75-d82dab81733d", groupTag: GROUP_TAGS[0], tier: 2 },
    { poolId: "38ce5b44-220c-4415-90d7-6d2df9b18869", groupTag: GROUP_TAGS[0], tier: 3 },
    { poolId: "55bd13a5-5cc4-4909-8cd1-e0a329777724", groupTag: GROUP_TAGS[0], tier: 4 },
    { poolId: "4687b4fa-3229-4334-a9e8-c916ce6e5180", groupTag: GROUP_TAGS[0], tier: 5 },
    { poolId: "40350cc8-070c-4fa1-b40b-6c6becf678bf", groupTag: GROUP_TAGS[0], tier: 6 },
    { poolId: "6a044e2f-1a36-4c74-97ef-37a27f48f041", groupTag: GROUP_TAGS[0], tier: 7 },
    { poolId: "9f2ae658-7734-4d5f-b774-b7151f7120ca", groupTag: GROUP_TAGS[0], tier: 8 },
    { poolId: "09d29a74-62f7-4def-ac46-7b23ba08bc4d", groupTag: GROUP_TAGS[0], tier: 9 },
    { poolId: "941e1495-bcf8-4d4a-8b2e-70ef942422c4", groupTag: GROUP_TAGS[0], tier: 10 },
    { poolId: "67b98578-84e7-4f55-803d-551ee830647b", groupTag: GROUP_TAGS[0], tier: 11 },
    { poolId: "d9ec8393-6a1c-4551-b0ac-cdbca8bf7e21", groupTag: GROUP_TAGS[1], tier: 1 },
    { poolId: "84aa1a27-f613-4023-a802-17f6be0f7405", groupTag: GROUP_TAGS[1], tier: 2 },
    { poolId: "6a9df740-006b-419c-b613-675e02011e54", groupTag: GROUP_TAGS[1], tier: 3 },
    { poolId: "f52bda4e-c5aa-4464-a280-c19df2a73e59", groupTag: GROUP_TAGS[1], tier: 4 },
    { poolId: "37b337f8-9e70-4f12-9be0-6f4733d22d4d", groupTag: GROUP_TAGS[1], tier: 5 },
    { poolId: "44e15f07-6313-48d6-b49a-461e72543126", groupTag: GROUP_TAGS[1], tier: 6 },
    { poolId: "9397e600-6a3a-4d92-bf49-71f12e47e5d8", groupTag: GROUP_TAGS[1], tier: 7 },
    { poolId: "e0a8e124-14a5-496b-b0a6-22d95cab345d", groupTag: GROUP_TAGS[1], tier: 8 },
    { poolId: "f896e0d4-7344-4e3e-a4fa-34d6e58157d8", groupTag: GROUP_TAGS[1], tier: 9 },
    { poolId: "2668f1a0-412b-48a8-9dc3-731b6cf37da2", groupTag: GROUP_TAGS[1], tier: 10 },
    { poolId: "859798b9-6962-40ba-9fff-1a7d7e6a3f80", groupTag: GROUP_TAGS[1], tier: 11 },
    { poolId: "7fdcd920-0efe-4136-a9a7-a619a1e6a99a", groupTag: GROUP_TAGS[2], tier: 1 },
    { poolId: "427c96d5-a976-4489-8952-1e699fc34658", groupTag: GROUP_TAGS[2], tier: 2 },
    { poolId: "918fea23-b45c-4591-8250-621431eef99e", groupTag: GROUP_TAGS[2], tier: 3 },
    { poolId: "915550f0-7bac-40fc-8349-5c20ccb9ac2b", groupTag: GROUP_TAGS[2], tier: 4 },
    { poolId: "d7ee9ae5-bb85-460c-85c7-c1e35b0064d3", groupTag: GROUP_TAGS[2], tier: 5 },
    { poolId: "1f48ab52-5a82-4367-99cb-c81cec42db3b", groupTag: GROUP_TAGS[2], tier: 6 },
    { poolId: "3734eee5-f21d-4f52-9afa-f049174fa6de", groupTag: GROUP_TAGS[2], tier: 7 },
    { poolId: "bd5d20a5-decf-4a69-bf26-9e238939915e", groupTag: GROUP_TAGS[2], tier: 8 },
    { poolId: "2054afa1-3685-420e-8a52-4674a8b335b5", groupTag: GROUP_TAGS[2], tier: 9 },
    { poolId: "601fb3c3-9086-4d22-bb62-9342855805a0", groupTag: GROUP_TAGS[2], tier: 10 },
    { poolId: "4b04ae83-0954-4989-a19b-ad2dfe3fce8e", groupTag: GROUP_TAGS[2], tier: 11 },
    { poolId: "57c7d168-2ffd-4181-bc90-9b91cf9f8e41", groupTag: GROUP_TAGS[3], tier: 1 },
    { poolId: "a0678caa-689c-44ee-a227-f7ab1c84464d", groupTag: GROUP_TAGS[3], tier: 2 },
    { poolId: "fc549dc4-af8d-4788-93ef-3b89f62f68d7", groupTag: GROUP_TAGS[3], tier: 3 },
    { poolId: "3aa432c3-ca06-40d3-b890-b1a8a66b3a54", groupTag: GROUP_TAGS[3], tier: 4 },
    { poolId: "d949f37c-dbb4-414c-8340-5d687b1153e0", groupTag: GROUP_TAGS[3], tier: 5 },
    { poolId: "447f4063-1bf8-4bb9-a8e3-5c62f69c6ccb", groupTag: GROUP_TAGS[3], tier: 6 },
    { poolId: "f446da3d-0448-4bec-8f78-ccfa797ce16a", groupTag: GROUP_TAGS[3], tier: 7 },
    { poolId: "7e5fd77a-376f-46c9-a9a5-16483b78cfc0", groupTag: GROUP_TAGS[3], tier: 8 },
    { poolId: "8ed07d5c-3006-4940-9e1f-76ebb29f66fa", groupTag: GROUP_TAGS[3], tier: 9 },
    { poolId: "ecffb875-f6a3-47b0-8e48-498c9655acb3", groupTag: GROUP_TAGS[3], tier: 10 },
    { poolId: "bb1c15f4-6959-4bf8-8f24-08de42d31fc6", groupTag: GROUP_TAGS[3], tier: 11 }
]);

const TOP_POOL_BY_GROUP_TIER = new Map(
    TOP_POOLS.map(({ groupTag, tier, poolId }) => [`${groupTag}:${tier}`, poolId])
);

function sourceGap(message, details = {}) {
    const error = new Error(message);
    error.code = "APK_ROUTE_DYNAMIC_SOURCE_GAP";
    error.details = details;
    throw error;
}

function specialTier(level, haveNothingGroup) {
    return haveNothingGroup
        ? level === 0
            ? 1
            : Math.min(12, Math.floor((level - 1) / 10) + 2)
        : Math.min(11, (Math.floor(Math.max(1, level) - 1) / 10 + 1) | 0);
}

export function planFormalSpecialGrowth({ contentIndex, session } = {}) {
    if (contentIndex?.packId !== "douluo1") return null;

    const character = session?.character ?? {};
    const flags = character.flags ?? {};
    const identityId = character.background?.identityId
        ?? "douluo2:identity.have-nothing";
    const talentGrade = character.talentProgression?.talentGrade;
    const isF = talentGrade === "F";
    const groupTag = isF
        ? GROUP_TAGS[4]
        : IDENTITY_GROUP_TAGS[identityId];
    if (!groupTag) {
        sourceGap(
            `斗一正式特殊成长缺少身份分组 ${identityId}`,
            { action: FORMAL_SPECIAL_GROWTH_ACTION, identityId }
        );
    }

    const level = Number(character.level);
    if (!Number.isFinite(level)) {
        sourceGap(
            `斗一正式特殊成长缺少等级段 ${groupTag}/${character.level}`,
            { action: FORMAL_SPECIAL_GROWTH_ACTION, groupTag, level: character.level }
        );
    }
    const haveNothingGroup = groupTag === GROUP_TAGS[4];
    const tier = specialTier(level, haveNothingGroup);
    const poolId = TOP_POOL_BY_GROUP_TIER.get(`${groupTag}:${tier}`);
    if (!poolId) {
        sourceGap(
            `斗一正式特殊成长缺少等级段 ${groupTag}/${level}`,
            { action: FORMAL_SPECIAL_GROWTH_ACTION, groupTag, level, tier }
        );
    }

    const age = Number(character.age);
    const suppressEncounter = flags[IDENTITY_SUPPRESS_ENCOUNTER_FLAG] === true
        && age < 12;
    return {
        target: `${SPECIAL_FLOW_PREFIX}${poolId}`,
        effects: [{
            type: "setFlag",
            key: SUPPRESS_ENCOUNTER_FLAG,
            value: suppressEncounter
        }],
        reason: FORMAL_SPECIAL_GROWTH_ACTION,
        groupTag,
        tier,
        poolId,
        identityId,
        talentGrade
    };
}

export const APK_FORMAL_SPECIAL_GROWTH_EVIDENCE = Object.freeze({
    schemaVersion: "apk-special-growth-runtime-evidence/1.0",
    source: Object.freeze({
        apkSha256: "E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C",
        module: "apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js",
        foundationModule: "apk-analysis/E4FB340E/derived/pretty/human-foundation-CduvzjjO.js",
        flow: FORMAL_SPECIAL_GROWTH_FLOW,
        action: FORMAL_SPECIAL_GROWTH_ACTION,
        sourceFunctions: ["Xi[ja]", "ra", "El/Rg", "la", "pi"]
    }),
    extraction: Object.freeze({
        mode: "static_source_mapping_only",
        gameplayExecuted: false,
        topPoolCount: TOP_POOLS.length,
        specialTargetPrefix: SPECIAL_FLOW_PREFIX,
        groupTags: [...GROUP_TAGS],
        identityGroups: { ...IDENTITY_GROUP_TAGS },
        topPools: TOP_POOLS.map(entry => ({ ...entry })),
        tierRules: Object.freeze({
            haveNothingOrF: "level 0 => 1; otherwise min(12, floor((level - 1) / 10) + 2)",
            identityGroup: "min(11, (floor(max(1, level) - 1) / 10 + 1) | 0)"
        }),
        refreshEncounterSuppression: Object.freeze({
            sourceFunction: "El/Rg",
            flag: SUPPRESS_ENCOUNTER_FLAG,
            prerequisiteFlag: IDENTITY_SUPPRESS_ENCOUNTER_FLAG,
            condition: "prerequisite flag === true && age < 12"
        })
    }),
    implementation: Object.freeze({
        runtime: "js/apk-special-growth-runtime.js",
        routeBridge: "js/apk-route-runtime.js",
        nextKnownBoundary: "douluo1:handler.formal-special-result"
    })
});

export default Object.freeze({
    APK_FORMAL_SPECIAL_GROWTH_EVIDENCE,
    APK_SPECIAL_GROWTH_RUNTIME_VERSION,
    planFormalSpecialGrowth
});
