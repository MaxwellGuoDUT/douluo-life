import { clonePlayerStateValue } from "./player-v2.js";
import { isPlayerV2 } from "./player-state-migration.js";

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function findPrimaryMartialSoulV2(player) {
    if (!Array.isArray(player.martialSouls)
        || player.martialSouls.length === 0) {
        return null;
    }

    return player.martialSouls.reduce((primary, soul) => {
        if (!primary) {
            return soul;
        }

        const primarySlot = Number.isInteger(primary?.slot)
            ? primary.slot
            : Number.POSITIVE_INFINITY;
        const soulSlot = Number.isInteger(soul?.slot)
            ? soul.slot
            : Number.POSITIVE_INFINITY;

        return soulSlot < primarySlot ? soul : primary;
    }, null);
}

export function getPrimaryMartialSoul(player) {
    if (!isPlainObject(player)) {
        return null;
    }

    if (isPlayerV2(player)) {
        const primarySoul = findPrimaryMartialSoulV2(player);
        return primarySoul ? clonePlayerStateValue(primarySoul) : null;
    }

    if (typeof player.spirit !== "string" || player.spirit.length === 0) {
        return null;
    }

    return {
        instanceId: null,
        definitionId: null,
        evolutionFamilyId: null,
        legacyName: player.spirit,
        slot: 1,
        soulRings: Array.isArray(player.soulRings)
            ? clonePlayerStateValue(player.soulRings)
            : []
    };
}

export function getPrimaryMartialSoulName(player) {
    if (!isPlainObject(player)) {
        return null;
    }

    if (!isPlayerV2(player)) {
        return typeof player.spirit === "string" && player.spirit.length > 0
            ? player.spirit
            : null;
    }

    const soul = findPrimaryMartialSoulV2(player);

    if (!soul) {
        return null;
    }

    return soul.legacyName || soul.name || soul.definitionId || null;
}

export function getSoulRingsForMartialSoul(player, instanceId) {
    if (!isPlainObject(player)) {
        return [];
    }

    if (!isPlayerV2(player)) {
        if (instanceId !== null && instanceId !== undefined) {
            return [];
        }

        return Array.isArray(player.soulRings)
            ? clonePlayerStateValue(player.soulRings)
            : [];
    }

    const soul = Array.isArray(player.martialSouls)
        ? player.martialSouls.find(entry => entry?.instanceId === instanceId)
        : null;

    return Array.isArray(soul?.soulRings)
        ? clonePlayerStateValue(soul.soulRings)
        : [];
}

export function getPrimarySoulRings(player) {
    if (!isPlainObject(player)) {
        return [];
    }

    if (!isPlayerV2(player)) {
        return Array.isArray(player.soulRings)
            ? clonePlayerStateValue(player.soulRings)
            : [];
    }

    const soul = findPrimaryMartialSoulV2(player);

    return Array.isArray(soul?.soulRings)
        ? clonePlayerStateValue(soul.soulRings)
        : [];
}

export function getActiveRoutes(player) {
    if (!isPlayerV2(player)
        || !Array.isArray(player.routeStates?.active)) {
        return [];
    }

    return clonePlayerStateValue(player.routeStates.active);
}
