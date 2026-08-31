import { createV05DestinyViewModel } from "./v05-destiny-cohort.js";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) freeze(child);
    return Object.freeze(value);
}
function normalized(value) { return String(value ?? "").trim().toLocaleLowerCase("zh-CN"); }

export const V05_DESTINY_SORTS = Object.freeze(["recommended", "seed", "level", "rings"]);

export function createV05DestinyExplorerRecords(manifest) {
    return freeze(createV05DestinyViewModel(manifest).map((record, recommendedIndex) => ({
        ...clone(record),
        recommendedIndex,
        searchText: normalized([
            record.title,
            record.summary,
            record.primaryMartialSoul?.name,
            record.primaryMartialSoul?.category,
            record.routeFacets.join(" ")
        ].join(" "))
    })));
}

export function filterV05Destinies(records, filters = {}) {
    const query = normalized(filters.query);
    const martialCategory = normalized(filters.martialCategory);
    const ringBand = normalized(filters.ringBand);
    const levelBand = normalized(filters.levelBand);
    const routeFacet = normalized(filters.routeFacet);
    const growthProfile = normalized(filters.growthProfile);
    const sort = V05_DESTINY_SORTS.includes(filters.sort) ? filters.sort : "recommended";
    const result = records.filter(record => (
        (!query || record.searchText.includes(query))
        && (!martialCategory || normalized(record.primaryMartialSoul?.category) === martialCategory)
        && (!ringBand || normalized(record.ringBand) === ringBand)
        && (!levelBand || normalized(record.levelBand) === levelBand)
        && (!routeFacet || record.routeFacets.some(facet => normalized(facet) === routeFacet))
        && (!growthProfile || normalized(record.growthProfile) === growthProfile)
    ));
    result.sort((left, right) => {
        if (sort === "seed") return left.seed.localeCompare(right.seed);
        if (sort === "level") return (right.level ?? Number(right.levelBand?.match(/\d+/u)?.[0]) ?? 0)
            - (left.level ?? Number(left.levelBand?.match(/\d+/u)?.[0]) ?? 0)
            || left.seed.localeCompare(right.seed);
        if (sort === "rings") return right.soulRingCount - left.soulRingCount || left.seed.localeCompare(right.seed);
        return left.recommendedIndex - right.recommendedIndex;
    });
    return freeze(result.map(clone));
}

export function createV05DestinyFilterOptions(records) {
    const values = key => [...new Set(records.map(key).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    return freeze({
        martialCategories: values(record => record.primaryMartialSoul?.category),
        ringBands: values(record => record.ringBand),
        levelBands: values(record => record.levelBand),
        routeFacets: [...new Set(records.flatMap(record => record.routeFacets))].sort((a, b) => a.localeCompare(b, "zh-CN")),
        growthProfiles: values(record => record.growthProfile)
    });
}

export default Object.freeze({
    V05_DESTINY_SORTS,
    createV05DestinyExplorerRecords,
    filterV05Destinies,
    createV05DestinyFilterOptions
});
