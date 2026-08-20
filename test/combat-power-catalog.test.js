import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const catalog = JSON.parse(readFileSync(
    resolve("data/rules/combat.json"),
    "utf8"
));
const runtimeRules = JSON.parse(readFileSync(
    resolve("data/config/combat-power.json"),
    "utf8"
));

test("combat rule catalog records the workbook source and the civilian observer route", () => {
    assert.equal(catalog.schemaVersion, "combat-rule-catalog/1.0");
    assert.equal(catalog.source.file, "battle_power_template.xlsx");
    assert.equal(catalog.source.supplementalSources[0].file, "powerv01.docx");
    assert.equal(catalog.source.sheet, "战力模板");
    assert.equal(catalog.source.range, "A1:N21");
    assert.equal(catalog.progressionRoutes.civilian_observer.startingLevel, 0);
    assert.equal(
        catalog.progressionRoutes.civilian_observer.combatParticipation,
        "none"
    );
    assert.equal(
        catalog.progressionRoutes.civilian_observer.staticCombatPower,
        0
    );
});

test("catalog and runtime config agree on table-driven quality and soul-item anchors", () => {
    assert.deepEqual(
        catalog.human.martialSoulQuality.coefficients,
        runtimeRules.martialSoulQuality.coefficients
    );
    assert.equal(
        catalog.soulItems.ageBrackets.find(bracket => bracket.minYears === 500)
            .basePower,
        runtimeRules.soulRings.ageBrackets.find(bracket => bracket.minYears === 500)
            .basePower
    );
    assert.equal(
        runtimeRules.soulRings.fixedSlotPower[0].fixedPower,
        catalog.soulItems.humanSoulRingSlots10To16.fixedPower
    );
    assert.equal(
        runtimeRules.ruleCatalog.catalogVersion,
        catalog.catalogVersion
    );
    assert.equal(runtimeRules.rulesVersion, "combat-power/2.0");
    assert.equal(runtimeRules.divineArmor.multiplierInterpretation, "total_multiplier_3x");
    assert.deepEqual(
        runtimeRules.divineArmor.efficiencyByDivinePositionCount.map(rule => rule.coefficient),
        [1, 0.8, 0.6, 0.4]
    );
});

test("catalog retains unresolved boundaries while recording confirmed examples", () => {
    assert.equal(catalog.baseModes.level.confirmedThroughLevel, 10);
    assert.equal(catalog.baseModes.level.aboveLevel10.status, "unresolved");
    assert.equal(
        catalog.baseModes.level.powerEntries.find(entry => entry.level === 99).power,
        760
    );
    assert.equal(
        catalog.baseModes.level.powerEntries.find(entry => entry.level === 100).power,
        1260
    );
    assert.equal(
        catalog.baseModes.soul_beast_cultivation.derivedFormula.mode,
        "piecewise_linear_between_anchors"
    );
    assert.equal(
        catalog.baseModes.soul_beast_cultivation.unlistedYears.status,
        "confirmed_by_derived_formula"
    );
    assert.equal(catalog.soulItems.divineArmorComponent.runtimeInterpretation, "total_multiplier_3x");
    assert.equal(catalog.soulItems.bloodlineDistribution.requiredTotalPercentage, 100);
});
