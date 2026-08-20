#!/usr/bin/env python3
"""Generate the confirmed main-mode martial-soul catalog from the review XLSX.

The workbook is opened read-only as an OOXML zip. The generator never writes to
or re-saves the source workbook and uses only Python's standard library.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


CATALOG_VERSION = "martial-souls/1.1"
SCHEMA_VERSION = "martial-soul-catalog/1.0"
SOURCE_REVIEW = "MARTIAL_SOUL_REVIEW_2026-08-10"
DECISION_SCHEMA_VERSION = "martial-soul-review-decisions/1.0"
SHEET_NAME = "武魂审定"
MAIN_CANON_LEVELS = {"canon", "expanded"}
FORM_TOKENS = {
    "器": "tool",
    "兽": "beast",
    "植物": "plant",
    "本体": "body",
    "食物": "food",
}
QUALITY_TOKENS = {
    "低等": "low",
    "普通": "ordinary",
    "顶级": "top",
    "极致": "extreme",
}
REQUIRED_HEADERS = (
    "武魂名称",
    "建议唯一ID",
    "审定状态",
    "确认形态",
    "确认品质",
    "确认属性",
    "确认canonLevel",
    "审定结果",
)
ATTRIBUTE_SPLIT_RE = re.compile(r"[/、,，;；]+")
NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_DOC_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_PKG_REL = "http://schemas.openxmlformats.org/package/2006/relationships"


class CatalogGenerationError(RuntimeError):
    """Raised when the reviewed workbook cannot produce the confirmed catalog."""


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def column_index(cell_reference: str) -> int:
    match = re.match(r"([A-Z]+)", cell_reference)
    if not match:
        raise CatalogGenerationError(
            f"Invalid worksheet cell reference: {cell_reference!r}"
        )
    result = 0
    for character in match.group(1):
        result = result * 26 + ord(character) - ord("A") + 1
    return result - 1


def load_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    try:
        root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []

    values: list[str] = []
    for entry in root.findall(f"{{{NS_MAIN}}}si"):
        fragments = [
            node.text or ""
            for node in entry.iter(f"{{{NS_MAIN}}}t")
        ]
        values.append("".join(fragments))
    return values


def resolve_sheet_path(archive: zipfile.ZipFile, sheet_name: str) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relationship_id = None
    for sheet in workbook.findall(f".//{{{NS_MAIN}}}sheet"):
        if sheet.attrib.get("name") == sheet_name:
            relationship_id = sheet.attrib.get(f"{{{NS_DOC_REL}}}id")
            break
    if not relationship_id:
        raise CatalogGenerationError(f"Worksheet {sheet_name!r} was not found.")

    relationships = ET.fromstring(
        archive.read("xl/_rels/workbook.xml.rels")
    )
    target = None
    for relationship in relationships.findall(f"{{{NS_PKG_REL}}}Relationship"):
        if relationship.attrib.get("Id") == relationship_id:
            target = relationship.attrib.get("Target")
            break
    if not target:
        raise CatalogGenerationError(
            f"Worksheet relationship {relationship_id!r} was not found."
        )

    normalized = target.replace("\\", "/").lstrip("/")
    return normalized if normalized.startswith("xl/") else f"xl/{normalized}"


def parse_cell(cell: ET.Element, shared_strings: list[str]):
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(
            node.text or "" for node in cell.iter(f"{{{NS_MAIN}}}t")
        )

    value_node = cell.find(f"{{{NS_MAIN}}}v")
    if value_node is None or value_node.text is None:
        return None
    raw_value = value_node.text

    if cell_type == "s":
        try:
            return shared_strings[int(raw_value)]
        except (IndexError, ValueError) as error:
            raise CatalogGenerationError(
                f"Invalid shared string index {raw_value!r}."
            ) from error
    if cell_type in {"str", "e"}:
        return raw_value
    if cell_type == "b":
        return raw_value == "1"

    try:
        number = float(raw_value)
    except ValueError:
        return raw_value
    return int(number) if number.is_integer() else number


def read_sheet_rows(workbook_path: Path, sheet_name: str) -> list[list[object]]:
    with zipfile.ZipFile(workbook_path, "r") as archive:
        shared_strings = load_shared_strings(archive)
        sheet_path = resolve_sheet_path(archive, sheet_name)
        root = ET.fromstring(archive.read(sheet_path))

    rows: list[list[object]] = []
    for row in root.findall(f".//{{{NS_MAIN}}}sheetData/{{{NS_MAIN}}}row"):
        values: dict[int, object] = {}
        for cell in row.findall(f"{{{NS_MAIN}}}c"):
            reference = cell.attrib.get("r", "")
            values[column_index(reference)] = parse_cell(cell, shared_strings)
        if not values:
            rows.append([])
            continue
        width = max(values) + 1
        rows.append([values.get(index) for index in range(width)])
    return rows


def parse_attributes(value: object) -> list[str]:
    if value is None:
        return []
    text = str(value).strip()
    if not text or text in {"待补", "待确认"}:
        return []
    attributes: list[str] = []
    for fragment in ATTRIBUTE_SPLIT_RE.split(text):
        attribute = fragment.strip()
        if attribute and attribute not in attributes:
            attributes.append(attribute)
    return attributes


def require_text(value: object, field: str, row_number: int) -> str:
    if not isinstance(value, str) or not value.strip():
        raise CatalogGenerationError(
            f"Row {row_number} has an empty or invalid {field}."
        )
    return value.strip()


def load_review_decisions(decision_path: Path, workbook_path: Path) -> dict:
    try:
        document = json.loads(decision_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CatalogGenerationError(
            f"Unable to read review decisions {decision_path}: {error}"
        ) from error

    if document.get("schemaVersion") != DECISION_SCHEMA_VERSION:
        raise CatalogGenerationError("Unsupported review decision schemaVersion.")
    if document.get("status") != "approved":
        raise CatalogGenerationError("Review decisions must have approved status.")
    if document.get("decision") != "all_accepted":
        raise CatalogGenerationError("Review decisions are not fully accepted.")
    if document.get("sourceReview") != SOURCE_REVIEW:
        raise CatalogGenerationError("Review decisions reference an unknown source review.")
    workbook_hash = sha256_file(workbook_path)
    if document.get("sourceWorkbookSha256") != workbook_hash:
        raise CatalogGenerationError(
            "Review decisions do not match the source workbook SHA-256."
        )

    decisions = document.get("decisions")
    expected_count = document.get("expectedDecisionCount")
    if not isinstance(decisions, list) or expected_count != len(decisions):
        raise CatalogGenerationError("Review decision count is invalid.")
    if expected_count != 14:
        raise CatalogGenerationError("Exactly 14 approved review decisions are required.")

    allowed_forms = set(FORM_TOKENS.values())
    allowed_qualities = set(QUALITY_TOKENS.values())
    seen_ids: set[str] = set()
    for index, decision in enumerate(decisions):
        if not isinstance(decision, dict):
            raise CatalogGenerationError(
                f"Review decision {index + 1} must be an object."
            )
        definition_id = decision.get("definitionId")
        if not isinstance(definition_id, str) or not definition_id:
            raise CatalogGenerationError(
                f"Review decision {index + 1} has an invalid definitionId."
            )
        if definition_id in seen_ids:
            raise CatalogGenerationError(
                f"Duplicate review decision for {definition_id!r}."
            )
        seen_ids.add(definition_id)
        for field in ("priorForm", "confirmedForm"):
            if decision.get(field) not in allowed_forms:
                raise CatalogGenerationError(
                    f"Review decision {definition_id!r} has invalid {field}."
                )
        for field in ("priorQualityGrade", "confirmedQualityGrade"):
            if decision.get(field) not in allowed_qualities:
                raise CatalogGenerationError(
                    f"Review decision {definition_id!r} has invalid {field}."
                )
    return document


def apply_review_decision(definition: dict, decision: dict) -> dict:
    if definition["form"] != decision["priorForm"]:
        raise CatalogGenerationError(
            f"Review decision {definition['id']!r} priorForm does not match workbook."
        )
    if definition["qualityGrade"] != decision["priorQualityGrade"]:
        raise CatalogGenerationError(
            f"Review decision {definition['id']!r} priorQualityGrade does not match workbook."
        )
    return {
        **definition,
        "form": decision["confirmedForm"],
        "qualityGrade": decision["confirmedQualityGrade"],
        "reviewDecision": "MARTIAL_SOUL_CAPACITY_REVIEW_2026-08-10",
    }


def build_catalog(workbook_path: Path, decision_path: Path) -> dict:
    decision_document = load_review_decisions(decision_path, workbook_path)
    decisions_by_id = {
        decision["definitionId"]: decision
        for decision in decision_document["decisions"]
    }
    rows = read_sheet_rows(workbook_path, SHEET_NAME)
    if not rows:
        raise CatalogGenerationError("The review worksheet is empty.")

    headers = [str(value) if value is not None else "" for value in rows[0]]
    missing_headers = [header for header in REQUIRED_HEADERS if header not in headers]
    if missing_headers:
        raise CatalogGenerationError(
            f"Review worksheet is missing headers: {missing_headers!r}"
        )
    positions = {header: headers.index(header) for header in REQUIRED_HEADERS}

    definitions: list[dict] = []
    for row_number, values in enumerate(rows[1:], start=2):
        def field(name: str):
            index = positions[name]
            return values[index] if index < len(values) else None

        if field("审定结果") != "主模式候选":
            continue
        if field("审定状态") not in {"通过", "修改后通过"}:
            raise CatalogGenerationError(
                f"Row {row_number} is a main-mode candidate without an approved status."
            )

        definition_id = require_text(field("建议唯一ID"), "definition ID", row_number)
        name = require_text(field("武魂名称"), "name", row_number)
        form_text = require_text(field("确认形态"), "confirmed form", row_number)
        quality_text = require_text(field("确认品质"), "confirmed quality", row_number)
        canon_level = require_text(
            field("确认canonLevel"), "confirmed canonLevel", row_number
        )

        if form_text not in FORM_TOKENS:
            raise CatalogGenerationError(
                f"Row {row_number} has unknown confirmed form {form_text!r}."
            )
        if quality_text not in QUALITY_TOKENS:
            raise CatalogGenerationError(
                f"Row {row_number} has unknown confirmed quality {quality_text!r}."
            )
        if canon_level not in MAIN_CANON_LEVELS:
            raise CatalogGenerationError(
                f"Row {row_number} has forbidden main-mode canonLevel {canon_level!r}."
            )

        definition = {
            "id": definition_id,
            "name": name,
            "form": FORM_TOKENS[form_text],
            "qualityGrade": QUALITY_TOKENS[quality_text],
            "attributes": parse_attributes(field("确认属性")),
            "canonLevel": canon_level,
            "reviewStatus": "confirmed",
            "enabled": True,
            "sourceReview": SOURCE_REVIEW,
        }
        if definition_id in decisions_by_id:
            definition = apply_review_decision(
                definition,
                decisions_by_id.pop(definition_id)
            )
        definitions.append(definition)

    if decisions_by_id:
        raise CatalogGenerationError(
            "Review decisions reference definitions missing from the main-mode catalog: "
            f"{sorted(decisions_by_id)!r}"
        )

    definitions.sort(key=lambda definition: definition["id"])
    validate_catalog_definitions(definitions)
    return {
        "schemaVersion": SCHEMA_VERSION,
        "catalogVersion": CATALOG_VERSION,
        "status": "production",
        "sourceReview": SOURCE_REVIEW,
        "sourceWorkbookSha256": sha256_file(workbook_path),
        "reviewDecision": decision_document["reviewId"],
        "reviewDecisionSha256": sha256_file(decision_path),
        "approvedDecisionCount": len(decision_document["decisions"]),
        "allowedCanonLevels": ["canon", "expanded"],
        "definitions": definitions,
    }


def validate_catalog_definitions(definitions: list[dict]) -> None:
    if len(definitions) != 271:
        raise CatalogGenerationError(
            f"Expected 271 main-mode definitions, received {len(definitions)}."
        )

    names = [definition["name"] for definition in definitions]
    definition_ids = [definition["id"] for definition in definitions]
    if len(names) != len(set(names)):
        raise CatalogGenerationError("Duplicate martial-soul names were found.")
    if len(definition_ids) != len(set(definition_ids)):
        raise CatalogGenerationError("Duplicate martial-soul definition IDs were found.")

    canon_counts = {level: 0 for level in sorted(MAIN_CANON_LEVELS)}
    grid_counts = {
        (form, quality): 0
        for form in FORM_TOKENS.values()
        for quality in QUALITY_TOKENS.values()
    }
    for definition in definitions:
        canon_counts[definition["canonLevel"]] += 1
        grid_counts[(definition["form"], definition["qualityGrade"])] += 1

    if canon_counts != {"canon": 233, "expanded": 38}:
        raise CatalogGenerationError(
            f"Unexpected canon-level counts: {canon_counts!r}"
        )
    undersized_cells = [
        (cell, count) for cell, count in grid_counts.items() if count < 4
    ]
    if undersized_cells:
        raise CatalogGenerationError(
            f"Form-quality cells below four definitions: {undersized_cells!r}"
        )


def write_catalog(catalog: dict, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rendered = json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"
    output_path.write_text(rendered, encoding="utf-8", newline="\n")


def summarize(catalog: dict) -> dict:
    definitions = catalog["definitions"]
    summary = {
        "total": len(definitions),
        "canon": sum(item["canonLevel"] == "canon" for item in definitions),
        "expanded": sum(item["canonLevel"] == "expanded" for item in definitions),
        "grid": {},
    }
    for form in FORM_TOKENS.values():
        summary["grid"][form] = {}
        for quality in QUALITY_TOKENS.values():
            summary["grid"][form][quality] = sum(
                item["form"] == form and item["qualityGrade"] == quality
                for item in definitions
            )
    return summary


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--decisions", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify that the existing output exactly matches regenerated JSON.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    input_hash_before = sha256_file(args.input)
    catalog = build_catalog(args.input, args.decisions)
    rendered = json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"

    if args.check:
        if not args.output.is_file():
            raise CatalogGenerationError(
                f"Catalog output does not exist: {args.output}"
            )
        if args.output.read_text(encoding="utf-8") != rendered:
            raise CatalogGenerationError(
                "Existing catalog differs from deterministic regeneration."
            )
    else:
        write_catalog(catalog, args.output)

    input_hash_after = sha256_file(args.input)
    if input_hash_before != input_hash_after:
        raise CatalogGenerationError("Source workbook changed during generation.")

    print(json.dumps(summarize(catalog), ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except CatalogGenerationError as error:
        print(f"catalog generation failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
