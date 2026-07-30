# Event Schema v2 与战力系统决策记录

状态：`accepted`
适用阶段：Day 10 / Event Schema v2 与战力基础设施第一阶段
依据：`CODEX_NEXT_STAGE_V2_COMBAT.md`

本文件只记录已经由项目负责人确认的决策。仍需平衡或内容确认的项目集中列在文末，不把推断数据升级为正式规则。

## DR-001：旧表空权重迁移为 1

旧表中的空权重进入 Event Schema v2 正式数据时迁移为 `1`，并保留迁移来源：

```json
{
  "weight": 1,
  "weightSource": "legacy_empty_default",
  "reviewStatus": "inferred"
}
```

- 正数权重保留原值。
- 零权重保持 `0`，不参与抽取。
- v2 运行数据不允许 `weight: null`。
- `data/reference/legacy-wheel/` 是只读推断来源，不因本决策直接覆盖。

## DR-002：路线采用一条主线与多条支线

路线使用 lane 表达并发类别：

```text
main
faction
npc
deity
personal
temporary
```

- 同一时间最多一条 `main` 路线。
- 非主线路线可以并存，但是否在某年推进仍由 trigger、互斥组和年度调度决定。
- Player 最终需要保存按 lane/route 区分的持久路线状态，而不是只有一个 `activeRoute` 字符串。

## DR-003：多武魂禁止定义与进化族谱重复

武魂实例至少保存：

```json
{
  "instanceId": "martial_soul_slot_1",
  "definitionId": "clear_sky_hammer",
  "evolutionFamilyId": "hammer_clear_sky_family"
}
```

候选池建立时同时排除：

- 已拥有的 `definitionId`；
- 已拥有的 `evolutionFamilyId`；
- 同一定义的重复实例；
- 仅通过不同显示名称伪装的重复项。

候选池耗尽时停止本次生成并报告，不允许无限重抽。

## DR-004：核心路线使用互斥组

路线通过以下字段声明互斥：

```json
{
  "mutexGroups": ["major_faction_core"],
  "conflictPolicy": "block"
}
```

合法策略：

- `block`：默认；已有冲突路线时不激活新路线。
- `replace`：只有明确的转投、背叛等剧情才能替换旧路线。
- `branch`：只有明确的卧底、分裂路线等剧情才能建立分支。

`replace` 和 `branch` 不能由引擎根据 WheelID 或标题自行推断。

## DR-005：15 岁特殊经历使用合并候选池

```text
年龄 < 15：Wheel 66
年龄 >= 15：Wheel 66 + Wheel 71
```

- 两个来源池的初始池倍率均为 `1`。
- 合并后保留各 item 自身权重。
- 这不是“15 岁后只切换到 Wheel 71”。
- `flows.inferred.json` 中原有的条件二选一结构只作为旧推断记录，正式 v2 流程应采用合并池语义。

## DR-006：内容等级在候选池建立时过滤

适用的 wheel、item、flow、route、entity 支持：

```json
{
  "canonLevel": "canon"
}
```

合法值：

```text
canon
expanded
crossover
parody
```

过滤发生在候选池建立阶段；不允许先抽中再作废。

## DR-007：年龄只由 Game 在年度会话前推进

年度顺序：

```text
Game.advanceYear()
→ age + 1
→ 清理 annualFlags
→ 创建年度随机种子
→ 调度跨年路线
→ EventManager 抽取年度入口
→ WheelFlowEngine 执行本年流程
→ 保存年度历史
```

- `WheelFlowEngine` 不得修改年龄。
- Event Schema v2 的 `effects` 不得修改 `age`。
- `next_year` 只保存流程/路线状态并结束本年，不代表由流程引擎执行 `age + 1`。

## DR-008：战力是派生评分

Player 保存等级、武魂、魂环、魂骨、领域、属性、神位、神器等真实履历状态；战力由独立计算器根据版本化配置即时计算。

禁止：

```json
{
  "effects": {
    "combatPower": 50
  }
}
```

静态战力与战斗现场修正分离：

```text
staticCombatPower
effectiveCombatPower
```

战斗结果仍由转盘决定；有效战力差只用于调整结果转盘权重，不是必胜判定。

## 推断数据的证据等级

`conversion_report.json`、`flows.inferred.json`、`routes.inferred.json` 和 `wheels.normalized.json` 是内容档案与推断来源：

- `orderedWheelIds` 不是真实剧情跳转图。
- 相邻 WheelID 不自动生成正式 `next`。
- 标题中的“你选择”“你决定”仍是随机结果叙事，不是玩家按钮。
- 推断路线在人工确认连接关系前保持 `reviewStatus: "inferred"`。

## 尚未确认，不构成决策

- 99 级锚点所需累计额外 `220` 点的突破节点分配。
- 1 至 9 年魂环的合法处理方式。
- 完整的 1 至 169 级突破奖励表。
- 完整神位、神器、称号、魂核与魂兽基础战力表。
- 化形魂兽与半人半魂兽的 `hybrid` 基础战力公式。
- 战力差如何映射到战斗结果转盘权重。

以上内容只能使用显式配置占位、`provisional` 状态和 warning 继续开发。
