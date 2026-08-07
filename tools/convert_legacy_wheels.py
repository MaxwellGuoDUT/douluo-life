from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from collections import Counter, defaultdict
from pathlib import Path, PurePosixPath
from typing import Any
from xml.etree import ElementTree as ET


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
OFFICE_REL_NS = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
)
PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
NS = {"m": MAIN_NS, "r": OFFICE_REL_NS, "p": PACKAGE_REL_NS}


ROUTE_SPECS = [
    {
        "id": "foundation_and_shared_pools",
        "title": "基础生成与通用成长池",
        "legacyRange": [39, 81],
        "scope": "shared",
        "era": "mixed",
        "theme": "穿越时期、出身、武魂、天赋、特殊经历、魂环与通用成长",
    },
    {
        "id": "douluo1_canon_mainline",
        "title": "斗罗一原著主线干预",
        "legacyRange": [82, 121],
        "scope": "route",
        "era": "douluo_1",
        "theme": "史莱克、唐门、天斗宫变、海神岛、嘉陵关与神战",
    },
    {
        "id": "douluo2_entry",
        "title": "斗罗二开局短线",
        "legacyRange": [122, 128],
        "scope": "route_fragment",
        "era": "douluo_2",
        "theme": "霍雨浩、推荐信与史莱克学院入学",
    },
    {
        "id": "beggar_and_dual_master_route",
        "title": "乞丐师傅与双师路线",
        "legacyRange": [129, 153],
        "scope": "route",
        "era": "douluo_1",
        "theme": "父母实力、乞丐师傅、菊斗罗、杀戮之都与神考",
    },
    {
        "id": "mask_beauty_route",
        "title": "面具与极致颜值路线",
        "legacyRange": [256, 277],
        "scope": "route",
        "era": "douluo_1",
        "theme": "面具武魂、颜值喜剧、武魂进化与无相神结局",
    },
    {
        "id": "extreme_power_route",
        "title": "极限强化与举世皆敌路线",
        "legacyRange": [278, 294],
        "scope": "route",
        "era": "douluo_1",
        "theme": "冰火两仪眼、多武魂、举世皆敌、自创神位与众神围杀",
    },
    {
        "id": "seven_treasure_route",
        "title": "七宝琉璃宗与宁荣荣路线",
        "legacyRange": [295, 319],
        "scope": "route",
        "era": "douluo_1",
        "theme": "破产、宁荣荣、七杀剑意、毁灭与生命神考",
    },
    {
        "id": "soul_beast_devour_route",
        "title": "魂兽吞噬进化路线",
        "legacyRange": [320, 342],
        "scope": "route",
        "era": "douluo_1",
        "theme": "魂兽修炼、吞噬进化、兽潮与魂兽崛起",
    },
    {
        "id": "god_trial_short_route",
        "title": "早期神考短线",
        "legacyRange": [344, 354],
        "scope": "route_fragment",
        "era": "douluo_1",
        "theme": "神考、千仞雪与比比东、唐晨时代和自创神位",
    },
    {
        "id": "shared_support_355_357",
        "title": "魂兽修为与成功判定支持池",
        "legacyRange": [355, 357],
        "scope": "shared",
        "era": "mixed",
        "theme": "魂兽修为、仙草进化与是否成功",
    },
    {
        "id": "douluo3_route",
        "title": "斗罗三唐舞麟时代路线",
        "legacyRange": [358, 396],
        "scope": "route",
        "era": "douluo_3",
        "theme": "魂灵、升灵台、第二职业、史莱克、深渊位面与新神界",
    },
    {
        "id": "seagod_island_route",
        "title": "海神岛成长路线",
        "legacyRange": [397, 432],
        "scope": "route",
        "era": "douluo_1",
        "theme": "波塞西、千道流、海神之光、海神神考与兽潮",
    },
    {
        "id": "hunting_operation_route",
        "title": "猎魂行动短线",
        "legacyRange": [433, 440],
        "scope": "route_fragment",
        "era": "douluo_1",
        "theme": "猎魂行动、小舞、比比东、千仞雪与海神岛",
    },
    {
        "id": "soul_beast_growth_short_route",
        "title": "魂兽成长短线",
        "legacyRange": [449, 455],
        "scope": "route_fragment",
        "era": "douluo_1",
        "theme": "魂兽年份、先天魂力、躲避与击杀唐三",
    },
    {
        "id": "time_reversal_route",
        "title": "怀表与时间回溯路线",
        "legacyRange": [529, 549],
        "scope": "route",
        "era": "douluo_1",
        "theme": "魂环强化、唐昊与武魂殿、时空乱流和重生",
    },
    {
        "id": "phone_martial_soul_route",
        "title": "手机武魂与充值路线",
        "legacyRange": [550, 580],
        "scope": "route",
        "era": "douluo_1",
        "theme": "充值、首充礼包、手机武魂、武魂殿和幻神",
    },
    {
        "id": "time_rift_route",
        "title": "冰火两仪眼与时空裂隙路线",
        "legacyRange": [581, 605],
        "scope": "route",
        "era": "mixed",
        "theme": "独孤博、神秘人物、时空乱流与陌生时代",
    },
    {
        "id": "crossover_eye_fruit_route",
        "title": "写轮眼与果实跨界路线",
        "legacyRange": [606, 652],
        "scope": "route",
        "era": "crossover",
        "theme": "橡胶果实、写轮眼、魂导科技、信仰与神王神位",
    },
    {
        "id": "immortal_oath_route",
        "title": "不死复活与毒誓路线",
        "legacyRange": [653, 696],
        "scope": "route",
        "era": "parody",
        "theme": "性格、不死复活、人皇幡、毒誓和宇宙级喜剧结局",
    },
    {
        "id": "time_dragon_route",
        "title": "光阴圣龙与朱竹清路线",
        "legacyRange": [697, 732],
        "scope": "route",
        "era": "douluo_1",
        "theme": "龙类武魂、时间属性、朱竹清、蓝电霸王龙宗与自创神位",
    },
]


FLOW_SPECS = [
    {
        "id": "martial_soul_generation",
        "title": "武魂数量、类别与具体武魂",
        "confidence": "medium",
        "evidence": "Wheel 44给出数量，Wheel 43给出类别，Wheel 45-53分别是类别目录。",
        "notes": [
            "原表把类别轮盘排在数量轮盘之前，但没有保存多武魂时的真实调用顺序。",
            "此流程采用更可执行的“先数量、再重复类别与目录”的整理方式。",
        ],
        "entryNode": "spirit_count",
        "nodes": [
            {
                "id": "spirit_count",
                "op": "roll",
                "wheelId": 44,
                "saveAs": "martialSoulCount",
                "next": "repeat_spirit",
            },
            {
                "id": "repeat_spirit",
                "op": "repeatSubflow",
                "countFrom": "martialSoulCount",
                "subflowEntry": "spirit_type",
                "appendTo": "martialSouls",
                "next": "end",
            },
            {
                "id": "spirit_type",
                "op": "roll",
                "wheelId": 43,
                "saveAs": "currentMartialSoulType",
                "next": "spirit_catalog",
            },
            {
                "id": "spirit_catalog",
                "op": "dispatchWheel",
                "source": "currentMartialSoulType",
                "wheelByResult": {
                    "器武魂": 45,
                    "兽武魂": 46,
                    "植物武魂": 47,
                    "本体武魂": 48,
                    "神级武魂": 49,
                    "食物武魂": 50,
                    "邪灵武魂": 51,
                    "极致武魂": 52,
                    "变异武魂": 53,
                },
                "saveAs": "currentMartialSoul",
                "next": "return",
            },
            {"id": "return", "op": "return"},
            {"id": "end", "op": "end"},
        ],
    },
    {
        "id": "special_talent_acquisition",
        "title": "特殊天赋获取",
        "confidence": "high",
        "evidence": "是否有特殊天赋、特殊天赋数量、特殊天赋三个连续命名轮盘。",
        "entryNode": "talent_gate",
        "nodes": [
            {
                "id": "talent_gate",
                "op": "roll",
                "wheelId": 57,
                "saveAs": "hasSpecialTalent",
                "nextByResult": {"是": "talent_count", "否": "end"},
            },
            {
                "id": "talent_count",
                "op": "roll",
                "wheelId": 58,
                "saveAs": "specialTalentCount",
                "next": "talent_repeat",
            },
            {
                "id": "talent_repeat",
                "op": "repeatWheel",
                "wheelId": 59,
                "countFrom": "specialTalentCount",
                "unique": True,
                "appendTo": "specialTalents",
                "next": "end",
            },
            {"id": "end", "op": "end"},
        ],
    },
    {
        "id": "special_experience_acquisition",
        "title": "特殊经历获取",
        "confidence": "medium",
        "evidence": "Wheel 65决定次数，Wheel 66与71分别提供通用和15岁以上经历。",
        "entryNode": "experience_count",
        "nodes": [
            {
                "id": "experience_count",
                "op": "roll",
                "wheelId": 65,
                "saveAs": "specialExperienceCount",
                "next": "experience_repeat",
            },
            {
                "id": "experience_repeat",
                "op": "repeatWheelByCondition",
                "countFrom": "specialExperienceCount",
                "cases": [
                    {"when": {"age": {"gte": 15}}, "wheelId": 71},
                    {"when": {}, "wheelId": 66},
                ],
                "appendTo": "specialExperiences",
                "next": "end",
            },
            {"id": "end", "op": "end"},
        ],
    },
    {
        "id": "canon_interference_acquisition",
        "title": "原著剧情干预次数与内容",
        "confidence": "high",
        "evidence": "Wheel 73决定干预次数，Wheel 72列出干预的剧情。",
        "entryNode": "interference_count",
        "nodes": [
            {
                "id": "interference_count",
                "op": "roll",
                "wheelId": 73,
                "saveAs": "interferenceCount",
                "next": "interference_repeat",
            },
            {
                "id": "interference_repeat",
                "op": "repeatWheel",
                "wheelId": 72,
                "countFrom": "interferenceCount",
                "unique": True,
                "appendTo": "canonInterferences",
                "next": "end",
            },
            {"id": "end", "op": "end"},
        ],
    },
    {
        "id": "elite_tournament_gate",
        "title": "魂师精英大赛门槛与结果",
        "confidence": "high",
        "evidence": "Wheel 74为是否参加，Wheel 75为大赛结果。",
        "entryNode": "tournament_gate",
        "nodes": [
            {
                "id": "tournament_gate",
                "op": "roll",
                "wheelId": 74,
                "saveAs": "joinEliteTournament",
                "nextByResult": {"是": "tournament_result", "否": "end"},
            },
            {
                "id": "tournament_result",
                "op": "roll",
                "wheelId": 75,
                "saveAs": "eliteTournamentResult",
                "next": "end",
            },
            {"id": "end", "op": "end"},
        ],
    },
    {
        "id": "slaughter_city_gate",
        "title": "杀戮之都门槛与结果",
        "confidence": "high",
        "evidence": "Wheel 76为是否进入，Wheel 77为杀戮之行结果。",
        "entryNode": "slaughter_city_gate",
        "nodes": [
            {
                "id": "slaughter_city_gate",
                "op": "roll",
                "wheelId": 76,
                "saveAs": "enterSlaughterCity",
                "nextByResult": {"是": "slaughter_city_result", "否": "end"},
            },
            {
                "id": "slaughter_city_result",
                "op": "roll",
                "wheelId": 77,
                "saveAs": "slaughterCityResult",
                "next": "end",
            },
            {"id": "end", "op": "end"},
        ],
    },
]


CATALOG_TITLES = {
    "器武魂",
    "兽武魂",
    "植物武魂",
    "本体武魂",
    "神级武魂",
    "食物武魂",
    "邪灵武魂",
    "极致武魂",
    "变异武魂",
    "特殊天赋",
    "特殊经历",
    "15岁以上特殊经历",
    "性格",
    "龙类",
    "罗三炮武魂进化",
}


def qn(tag: str) -> str:
    return f"{{{MAIN_NS}}}{tag}"


def cell_column(address: str) -> int:
    match = re.match(r"[A-Z]+", address)
    if not match:
        raise ValueError(f"Invalid cell address: {address}")
    result = 0
    for char in match.group(0):
        result = result * 26 + ord(char) - 64
    return result - 1


def node_text(node: ET.Element) -> str:
    return "".join((part.text or "") for part in node.iter(qn("t")))


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_sheet_path(target: str) -> str:
    normalized = PurePosixPath(target.lstrip("/"))
    if normalized.parts and normalized.parts[0] == "xl":
        return str(normalized)
    return str(PurePosixPath("xl") / normalized)


def read_xlsx_rows(source: Path, sheet_name: str) -> tuple[list[str], list[dict[str, Any]]]:
    with zipfile.ZipFile(source) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared_strings = [node_text(node) for node in root.findall("m:si", NS)]

        workbook_root = ET.fromstring(archive.read("xl/workbook.xml"))
        relations_root = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relation_targets = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in relations_root.findall("p:Relationship", NS)
        }

        target = None
        for sheet in workbook_root.findall("m:sheets/m:sheet", NS):
            if sheet.attrib["name"] == sheet_name:
                relation_id = sheet.attrib[f"{{{OFFICE_REL_NS}}}id"]
                target = resolve_sheet_path(relation_targets[relation_id])
                break
        if target is None:
            raise ValueError(f'Worksheet "{sheet_name}" was not found.')

        sheet_root = ET.fromstring(archive.read(target))
        matrix: list[tuple[int, list[Any]]] = []
        for row_node in sheet_root.findall("m:sheetData/m:row", NS):
            excel_row = int(row_node.attrib["r"])
            values: list[Any] = []
            for cell in row_node.findall("m:c", NS):
                address = cell.attrib["r"]
                column = cell_column(address)
                while len(values) <= column:
                    values.append(None)
                cell_type = cell.attrib.get("t")
                value_node = cell.find("m:v", NS)
                inline = cell.find("m:is", NS)
                if cell_type == "s" and value_node is not None:
                    value: Any = shared_strings[int(value_node.text)]
                elif cell_type == "inlineStr" and inline is not None:
                    value = node_text(inline)
                elif cell_type == "b" and value_node is not None:
                    value = value_node.text == "1"
                elif value_node is None:
                    value = None
                else:
                    raw = value_node.text or ""
                    try:
                        number = float(raw)
                        value = int(number) if number.is_integer() else number
                    except ValueError:
                        value = raw
                values[column] = value
            matrix.append((excel_row, values))

    if not matrix:
        raise ValueError(f'Worksheet "{sheet_name}" is empty.')
    header = [str(value) if value is not None else "" for value in matrix[0][1]]
    expected_header = ["WheelID", "Title", "ItemIndex", "Text", "Weight"]
    if header[:5] != expected_header:
        raise ValueError(f"Unexpected header: {header[:5]!r}")

    records = []
    for excel_row, values in matrix[1:]:
        padded = values + [None] * (5 - len(values))
        record = {
            "sourceRow": excel_row,
            "wheelId": padded[0],
            "title": padded[1],
            "itemIndex": padded[2],
            "text": padded[3],
            "weight": padded[4],
        }
        records.append(record)
    return expected_header, records


def classify_role(title: str, item_count: int, item_texts: list[str]) -> str:
    if re.search(r"结局|最终结果", title):
        return "ending"
    if (
        "是否" in title
        or "否参加" in title
        or {"是", "否"}.issubset(set(item_texts))
    ):
        return "gate"
    if re.search(r"数量|有几次|几次|一共复活了|几头", title):
        return "count"
    if title in CATALOG_TITLES:
        return "catalog"
    if re.search(r"选择|决定|打算|准备|面对|接下来|你要", title):
        return "branch_roll"
    if re.search(
        r"魂环|魂力|等级|修为|魂灵|年份|年后|吸收|进化|提升|获得了|额外得到",
        title,
    ):
        return "progression"
    if re.search(r"结果|最后|成功|发现|得到|出现|达到|完成|变化", title):
        return "outcome"
    if item_count >= 20 and len(title) <= 10:
        return "catalog"
    return "event_roll"


def route_for_wheel(wheel_id: int) -> str | None:
    for route in ROUTE_SPECS:
        start, end = route["legacyRange"]
        if start <= wheel_id <= end:
            return route["id"]
    return None


def normalize_wheels(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[int, list[dict[str, Any]]] = {}
    for record in records:
        wheel_id = record["wheelId"]
        if not isinstance(wheel_id, int):
            raise ValueError(f"Non-integer WheelID at row {record['sourceRow']}: {wheel_id}")
        grouped.setdefault(wheel_id, []).append(record)

    route_sequences: dict[str, list[int]] = defaultdict(list)
    for wheel_id in sorted(grouped):
        route_id = route_for_wheel(wheel_id)
        if route_id:
            route_sequences[route_id].append(wheel_id)

    wheels = []
    for wheel_id, items in grouped.items():
        titles = {str(item["title"]) for item in items}
        if len(titles) != 1:
            raise ValueError(f"Wheel {wheel_id} has inconsistent titles: {sorted(titles)}")
        title = next(iter(titles))
        ordered_items = sorted(items, key=lambda item: item["itemIndex"])
        indexes = [item["itemIndex"] for item in ordered_items]
        if indexes != list(range(1, len(ordered_items) + 1)):
            raise ValueError(f"Wheel {wheel_id} has non-continuous ItemIndex: {indexes}")

        weights = [item["weight"] for item in ordered_items]
        explicit_count = sum(weight is not None for weight in weights)
        if explicit_count == 0:
            weight_mode = "all_implicit"
        elif explicit_count == len(weights):
            weight_mode = "all_explicit"
        else:
            weight_mode = "mixed"
        numeric_sum = sum(
            weight
            for weight in weights
            if isinstance(weight, (int, float)) and not isinstance(weight, bool)
        )
        probabilities_resolved = weight_mode == "all_explicit" and numeric_sum > 0

        route_id = route_for_wheel(wheel_id)
        next_hint = None
        if route_id:
            sequence = route_sequences[route_id]
            position = sequence.index(wheel_id)
            if position + 1 < len(sequence):
                next_hint = sequence[position + 1]

        normalized_items = []
        for item in ordered_items:
            weight = item["weight"]
            probability = (
                weight / numeric_sum
                if probabilities_resolved and isinstance(weight, (int, float))
                else None
            )
            normalized_items.append(
                {
                    "index": item["itemIndex"],
                    "text": item["text"],
                    "weight": weight,
                    "probability": probability,
                    "legacyDisabledHint": weight == 0,
                    "nextWheelId": None,
                    "effects": None,
                    "sourceRow": item["sourceRow"],
                }
            )

        wheels.append(
            {
                "id": f"legacy_wheel_{wheel_id}",
                "legacyWheelId": wheel_id,
                "title": title,
                "mode": "wheel",
                "roleHint": classify_role(
                    title, len(ordered_items), [str(item["text"]) for item in ordered_items]
                ),
                "primaryRouteHint": route_id,
                "itemCount": len(ordered_items),
                "weightProfile": {
                    "mode": weight_mode,
                    "explicitCount": explicit_count,
                    "implicitCount": len(weights) - explicit_count,
                    "zeroCount": sum(weight == 0 for weight in weights),
                    "numericSum": numeric_sum if explicit_count else None,
                    "probabilitiesResolved": probabilities_resolved,
                },
                "routingHint": {
                    "nextLegacyWheelId": next_hint,
                    "basis": "numeric_order_within_inferred_route",
                    "confidence": "low",
                },
                "items": normalized_items,
            }
        )
    return wheels


def build_routes(wheels: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_route: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for wheel in wheels:
        if wheel["primaryRouteHint"]:
            by_route[wheel["primaryRouteHint"]].append(wheel)

    routes = []
    for spec in ROUTE_SPECS:
        route_wheels = sorted(
            by_route.get(spec["id"], []), key=lambda wheel: wheel["legacyWheelId"]
        )
        ending_ids = [
            wheel["legacyWheelId"]
            for wheel in route_wheels
            if wheel["roleHint"] == "ending"
        ]
        routes.append(
            {
                **spec,
                "inference": {
                    "status": "inferred",
                    "confidence": "medium" if spec["scope"] == "shared" else "low",
                    "warning": "范围与顺序依据WheelID、标题和内容主题推断，不代表已恢复原项目跳转图。",
                },
                "entryWheelIdHint": (
                    route_wheels[0]["legacyWheelId"] if route_wheels else None
                ),
                "endingWheelIds": ending_ids,
                "orderedWheelIds": [
                    wheel["legacyWheelId"] for wheel in route_wheels
                ],
            }
        )
    return routes


def duplicate_items_within_wheels(
    wheels: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    duplicates = []
    for wheel in wheels:
        counts = Counter(item["text"] for item in wheel["items"])
        for text, count in counts.items():
            if count > 1:
                duplicates.append(
                    {
                        "wheelId": wheel["legacyWheelId"],
                        "title": wheel["title"],
                        "text": text,
                        "count": count,
                        "indexes": [
                            item["index"]
                            for item in wheel["items"]
                            if item["text"] == text
                        ],
                    }
                )
    return duplicates


def referenced_flow_wheel_ids(flows: list[dict[str, Any]]) -> set[int]:
    wheel_ids: set[int] = set()
    for flow in flows:
        for node in flow["nodes"]:
            if isinstance(node.get("wheelId"), int):
                wheel_ids.add(node["wheelId"])
            wheel_ids.update(
                value
                for value in node.get("wheelByResult", {}).values()
                if isinstance(value, int)
            )
            wheel_ids.update(
                case["wheelId"]
                for case in node.get("cases", [])
                if isinstance(case.get("wheelId"), int)
            )
    return wheel_ids


def validate_flow_nodes(flows: list[dict[str, Any]]) -> bool:
    for flow in flows:
        node_ids = {node["id"] for node in flow["nodes"]}
        if flow["entryNode"] not in node_ids:
            return False
        targets: list[str] = []
        for node in flow["nodes"]:
            if isinstance(node.get("next"), str):
                targets.append(node["next"])
            if isinstance(node.get("subflowEntry"), str):
                targets.append(node["subflowEntry"])
            targets.extend(
                target
                for target in node.get("nextByResult", {}).values()
                if isinstance(target, str)
            )
        if any(target not in node_ids for target in targets):
            return False
    return True


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert the legacy wheel workbook into normalized JSON references."
    )
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--sheet", default="AllItems")
    args = parser.parse_args()

    source = args.input.resolve()
    output_dir = args.output_dir.resolve()
    if not source.exists():
        raise FileNotFoundError(source)

    header, records = read_xlsx_rows(source, args.sheet)
    wheels = normalize_wheels(records)
    routes = build_routes(wheels)
    source_hash = hash_file(source)
    metadata = {
        "schemaVersion": "legacy-wheel-conversion/1.0",
        "sourceFile": source.name,
        "sourceSha256": source_hash,
        "sourceSheet": args.sheet,
        "sourceRange": f"A1:E{len(records) + 1}",
        "header": header,
        "interpretation": "每个WheelID是一个必须通过随机转盘解析的节点；Title中的“选择”不表示玩家手动选择。",
    }

    legacy_rows_payload = {
        "metadata": metadata,
        "records": records,
    }
    wheels_payload = {
        "metadata": {
            **metadata,
            "weightSemantics": {
                "null": "原表未定义；转换时保持null，不擅自视为1或0。",
                "zero": "很可能表示停用或不可达，但仅标记legacyDisabledHint，不删除。",
                "positive": "仅在同一轮盘全部权重明确且总和大于0时计算probability。",
            },
            "routingSemantics": {
                "itemNextWheelId": "原表没有保存，保持null。",
                "wheelRoutingHint": "仅按推断路线内的WheelID顺序生成，置信度为low。",
            },
        },
        "wheels": wheels,
    }
    routes_payload = {
        "metadata": {
            **metadata,
            "warning": "路线分段是内容整理结果，不是从原项目代码恢复的正式剧情图。",
        },
        "routes": routes,
    }
    flows_payload = {
        "metadata": {
            **metadata,
            "runtimeModel": "一次年度活动可以连续执行多个roll、gate、repeat、dispatch节点，直到end。",
            "warning": "仅包含可以从标题和相邻轮盘较可靠推断的复合流程。",
        },
        "flows": FLOW_SPECS,
    }

    duplicate_items = duplicate_items_within_wheels(wheels)
    title_to_wheels: dict[str, list[int]] = defaultdict(list)
    for wheel in wheels:
        title_to_wheels[wheel["title"]].append(wheel["legacyWheelId"])
    weight_modes = Counter(wheel["weightProfile"]["mode"] for wheel in wheels)
    unassigned_route_ids = [
        wheel["legacyWheelId"] for wheel in wheels if not wheel["primaryRouteHint"]
    ]
    wheel_ids = {wheel["legacyWheelId"] for wheel in wheels}
    route_wheel_ids = [
        wheel_id for route in routes for wheel_id in route["orderedWheelIds"]
    ]
    flow_wheel_ids = referenced_flow_wheel_ids(FLOW_SPECS)
    resolved_probability_sums_are_one = all(
        not wheel["weightProfile"]["probabilitiesResolved"]
        or abs(
            sum(
                item["probability"]
                for item in wheel["items"]
                if item["probability"] is not None
            )
            - 1
        )
        < 1e-12
        for wheel in wheels
    )
    report = {
        "metadata": metadata,
        "counts": {
            "sourceRows": len(records),
            "wheels": len(wheels),
            "uniqueTitles": len(title_to_wheels),
            "itemsAfterGrouping": sum(wheel["itemCount"] for wheel in wheels),
            "routes": len(routes),
            "inferredCompoundFlows": len(FLOW_SPECS),
        },
        "weightProfiles": dict(weight_modes),
        "zeroWeightItems": sum(
            wheel["weightProfile"]["zeroCount"] for wheel in wheels
        ),
        "duplicateItemsWithinWheel": duplicate_items,
        "reusedTitles": {
            title: wheel_ids
            for title, wheel_ids in title_to_wheels.items()
            if len(wheel_ids) > 1
        },
        "unassignedRouteWheelIds": unassigned_route_ids,
        "validation": {
            "sourceAndGroupedItemCountsMatch": len(records)
            == sum(wheel["itemCount"] for wheel in wheels),
            "allItemIndexesContinuous": True,
            "allWheelTitlesConsistent": True,
            "allWheelsAssignedToRouteHint": len(unassigned_route_ids) == 0,
            "resolvedProbabilitySumsEqualOne": resolved_probability_sums_are_one,
            "allRouteWheelReferencesExist": set(route_wheel_ids).issubset(wheel_ids),
            "routeCoverageIsExactlyOnce": len(route_wheel_ids) == len(wheel_ids)
            and len(set(route_wheel_ids)) == len(wheel_ids),
            "allFlowWheelReferencesExist": flow_wheel_ids.issubset(wheel_ids),
            "allFlowNodeReferencesExist": validate_flow_nodes(FLOW_SPECS),
        },
    }

    write_json(output_dir / "legacy_rows.json", legacy_rows_payload)
    write_json(output_dir / "wheels.normalized.json", wheels_payload)
    write_json(output_dir / "routes.inferred.json", routes_payload)
    write_json(output_dir / "flows.inferred.json", flows_payload)
    write_json(output_dir / "conversion_report.json", report)

    for filename in (
        "legacy_rows.json",
        "wheels.normalized.json",
        "routes.inferred.json",
        "flows.inferred.json",
        "conversion_report.json",
    ):
        with (output_dir / filename).open("r", encoding="utf-8") as handle:
            json.load(handle)

    print(
        json.dumps(
            {
                "outputDir": str(output_dir),
                "rows": len(records),
                "wheels": len(wheels),
                "routes": len(routes),
                "flows": len(FLOW_SPECS),
                "weightProfiles": dict(weight_modes),
                "duplicateItemsWithinWheel": len(duplicate_items),
                "validation": report["validation"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
