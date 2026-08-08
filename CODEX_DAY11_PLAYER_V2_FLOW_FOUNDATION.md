# Codex 下一阶段任务书：Player State v2、迁移适配器与流程运行基础

> **HISTORICAL TASK RECORD**：本文是 Day 11 的负责人任务书，保留用于追溯当时范围与决策，不是当前开发指令或项目真相源。

项目：斗罗大陆魂师人生转盘模拟器  
建议阶段：Day 11  
当前分支：`codex/day10-v2-combat-foundation`  
当前本地提交：`1a60348 feat: add event schema v2 and combat power foundation`

## 一、当前开发进度基线

Day 10 已完成 Event Schema v2 草案、负责人决策记录、数据驱动战力配置、纯函数战力计算器和相关测试。现有 UI、Game、EventManager、Player v1 和旧转盘数据未被大规模改写。

当前 Day 10 提交尚未推送远端。开始本阶段前先执行：

```powershell
git status
git push -u origin codex/day10-v2-combat-foundation
```

不要使用 `git add .`，避免把既有未暂存输入材料混入本阶段功能提交。

当前未暂存的负责人输入材料：

```text
docs/AI_CONTEXT.md
CODEX_NEXT_STAGE_V2_COMBAT.md
data/reference/
docs/WHEEL_FLOW_MODEL.md
tools/
```

本阶段默认只读取，不修改、不暂存、不提交这些材料。完成报告中单独列出其状态。

## 二、架构判断

下一步应优先实现：

```text
Player State v2
+ Player v1 → v2 迁移适配器
+ 兼容读取层
```

原因：

1. 战力计算器需要多武魂、魂环归属、领域、属性和神装等结构化输入。
2. WheelFlowEngine 需要 `annualFlags`、`routeStates` 和 `spinHistory`。
3. Event Schema v2 验证器需要知道 effects 和 trigger 可以访问哪些作用域及路径。
4. 如果先写完整流程引擎，再设计 Player v2，会发生接口返工。
5. 现有 Player v1 仍在正常运行，因此不能直接原地替换。

本阶段采用并行策略：建立 Player v2，保留 Player v1 运行，通过纯迁移适配器连接两者。不要在本阶段直接把 `Game.newGame()` 切换到 Player v2。

## 三、开发顺序

严格按以下顺序推进：

1. Player State v2 与迁移适配器。
2. Event Schema v2 静态验证器。
3. 路线状态与 AnnualSession。
4. WheelFlowEngine 最小骨架。
5. 最小战力 UI，排在最后且只做只读展示。

# 第一阶段：Player State v2

## 四、目标文件

建议新增：

```text
docs/PLAYER_STATE_V2.md
js/player-v2.js
js/player-state-migration.js
js/player-selectors.js
test/player-v2.test.js
test/player-state-migration.test.js
```

如果现有目录命名习惯不同，可以调整文件名，但职责必须分离。不要删除或覆盖 `js/player.js`。

## 五、Player v2 最小结构

```json
{
  "schemaVersion": "player/2.0",
  "name": "主角",
  "age": 0,
  "level": 1,
  "rank": "未觉醒",
  "combatBase": { "mode": "level" },
  "martialSouls": [],
  "activeMartialSoulInstanceId": null,
  "soulBones": {
    "head": null,
    "torso": null,
    "leftArm": null,
    "rightArm": null,
    "leftLeg": null,
    "rightLeg": null,
    "external": null
  },
  "domains": [],
  "combatAttributes": [],
  "soulCores": [],
  "deities": [],
  "artifacts": [],
  "combatTitles": [],
  "otherCombatSources": [],
  "academy": null,
  "faction": null,
  "title": "平民",
  "money": 0,
  "reputation": 0,
  "flags": {},
  "routeStates": {
    "active": [],
    "completed": [],
    "failed": [],
    "blocked": []
  },
  "annualFlags": {},
  "spinHistory": [],
  "history": []
}
```

禁止加入：

```text
combatPower
staticCombatPower
effectiveCombatPower
```

这些数值必须由计算器临时推导。

`activeRoutes` 不作为第二份独立存储。活动路线统一从 `routeStates.active` 读取，避免同一信息保存两次。

## 六、武魂实例最小结构

```json
{
  "instanceId": "ms_001",
  "definitionId": "clear_sky_hammer",
  "evolutionFamilyId": "hammer_clear_sky_family",
  "legacyName": null,
  "slot": 1,
  "awakenedAge": 6,
  "status": "active",
  "sealed": false,
  "soulRings": [],
  "mutations": [],
  "evolutionHistory": [],
  "flags": {},
  "routeHooksActivated": []
}
```

规则：

- `instanceId` 在角色内部唯一。
- `definitionId` 不得重复。
- `evolutionFamilyId` 不得重复。
- `slot` 为正整数且不得重复。
- `activeMartialSoulInstanceId` 必须为 `null` 或引用现有实例。
- 未解析的旧武魂不能伪造正式实体 ID。
- 未解析旧武魂使用 `definitionId: null` 和 `legacyName` 保存原文。

## 七、魂环实例最小结构

```json
{
  "slot": 1,
  "years": 423,
  "tier": "百年",
  "ringType": "normal",
  "soulBeastBloodlineGrade": "top",
  "sourceType": "soul_beast",
  "qualityMultiplier": null,
  "sourceEntityId": null,
  "acquiredAge": null,
  "flags": {}
}
```

规则：

- 魂环必须存放在对应的 `martialSouls[].soulRings` 中。
- 不再把正式魂环存放于 Player 顶层。
- `slot` 在同一个武魂实例中唯一。
- 神级金色魂环使用 `ringType: "divine_gold"`。
- 神赐魂环使用 `sourceType: "god_bestowed"`。
- 旧数据无法确认血脉时写 `null`，不得擅自填成普通血脉。
- `qualityMultiplier` 只用于神赐或其他非魂兽来源的明确品质倍率。

## 八、魂骨实例最小结构

```json
{
  "definitionId": null,
  "name": "左臂魂骨",
  "years": 50000,
  "tier": "万年",
  "soulBeastBloodlineGrade": "top",
  "sourceType": "soul_beast",
  "equipmentState": "soul_bone",
  "divineMultiplier": null,
  "boundMartialSoulInstanceId": null,
  "flags": {}
}
```

`equipmentState` 至少允许：

```text
soul_bone
divine_armor
```

神装化部位替换普通魂骨战力，不重复计算。神装套装奖励不要写进单个魂骨。本阶段可继续通过 `otherCombatSources` 表达临时验收数据，但不要补完整神装系统。

## 九、路线状态最小结构

```json
{
  "routeId": "route_clear_sky_sect",
  "lane": "faction",
  "nodeId": "sect_trial",
  "startedAge": 8,
  "lastAdvancedAge": 9,
  "status": "active",
  "data": {},
  "flags": {},
  "visitCounts": {}
}
```

规则：

- 同一时间最多一条 `main`。
- 相同 route 不重复进入。
- 完成、失败或阻塞后移动到对应数组。
- 不保留同一路线的两份活动状态。
- 路线互斥检查由后续路线状态模块实现。

# 第二阶段：迁移适配器

## 十、迁移函数要求

建议提供：

```js
createPlayerV2()
migratePlayerV1ToV2(playerV1)
ensurePlayerV2(player)
isPlayerV2(player)
```

要求：

- 全部为纯函数或明确的新对象工厂。
- 不修改输入对象。
- 支持 JSON 序列化和反序列化。
- 对同一输入产生稳定结果。
- v2 输入再次经过 `ensurePlayerV2` 时不得重复迁移。
- 不计算或保存战力。
- 不静默丢弃无法识别的旧字段。

建议迁移结果包含 warnings：

```json
{
  "player": {},
  "warnings": [
    {
      "code": "UNRESOLVED_LEGACY_MARTIAL_SOUL",
      "message": "旧武魂名称尚未解析为正式definitionId"
    }
  ]
}
```

## 十一、Player v1 迁移规则

基础字段原样迁移：

```text
name
age
level
rank
academy
faction
title
money
reputation
history
soulBones
```

所有数组和对象必须深复制。

### spirit

如果 `playerV1.spirit === null`：

```text
martialSouls = []
activeMartialSoulInstanceId = null
```

如果存在旧 `spirit` 字符串：

```json
{
  "instanceId": "ms_legacy_1",
  "definitionId": null,
  "evolutionFamilyId": null,
  "legacyName": "蓝银草",
  "slot": 1,
  "awakenedAge": null,
  "status": "active",
  "sealed": false,
  "soulRings": [],
  "mutations": [],
  "evolutionHistory": [],
  "flags": { "migratedFromV1": true },
  "routeHooksActivated": []
}
```

不要仅根据中文名称自动生成正式 `definitionId`。

### soulRings

旧 Player v1 的顶层 `soulRings` 附加到第一个武魂实例。旧结构中的 `age` 实际表示魂环年限，迁移为 `years`。

```json
{
  "slot": 1,
  "years": 423,
  "tier": "百年",
  "ringType": "normal",
  "soulBeastBloodlineGrade": null,
  "sourceType": "legacy_unknown",
  "qualityMultiplier": null,
  "sourceEntityId": null,
  "acquiredAge": null,
  "flags": { "migratedFromV1": true }
}
```

如果旧角色没有 `spirit` 却存在魂环：

- 创建一个未解析的占位武魂实例。
- `definitionId` 保持 `null`。
- 添加 warning。
- 不丢弃魂环。
- 不假设它属于任何正式武魂。

### soulBones

旧魂骨中的 `age` 按年限迁移为 `years`。无法确认的血脉、来源和实体 ID 保持 `null` 或 `legacy_unknown`，并给出 warning。

# 第三阶段：兼容策略

## 十二、运行时兼容原则

本阶段继续让现有 Player v1、Game、EventManager、UI 和 Effects 保持原运行方式。

新增 Player v2 模块暂时用于：

- 数据协议测试。
- 迁移测试。
- 战力计算输入。
- Event Schema v2 验证。
- 后续 WheelFlowEngine 测试夹具。

不要在本阶段修改 `Game.newGame()` 返回 Player v2。

## 十三、兼容选择器

新增只读选择器，例如：

```js
getPrimaryMartialSoul(player)
getPrimaryMartialSoulName(player)
getSoulRingsForMartialSoul(player, instanceId)
getPrimarySoulRings(player)
getActiveRoutes(player)
```

选择器可以接受 v1 或 v2。

禁止：

- 在 v2 中继续保存可变的顶层 `spirit` 镜像。
- 在 v2 中继续保存可变的顶层 `soulRings` 镜像。
- 通过两套字段互相同步。
- 使用 setter 隐式创建武魂实体。

兼容应通过读取层完成，不通过重复存储完成。

# 第四阶段：Player v2 验收测试

## 十四、必须通过的测试

至少覆盖：

1. `createPlayerV2()` 每次返回相互独立的对象。
2. 默认 Player v2 不含 `combatPower`。
3. Player v2 可以 JSON round-trip。
4. v1 基础字段完整迁移。
5. v1 输入对象未被修改。
6. `spirit: null` 正确迁移为空武魂列表。
7. 旧 `spirit` 字符串迁移为未解析武魂实例。
8. 旧顶层魂环迁移到第一个武魂。
9. 无武魂但有魂环时不丢数据，并生成 warning。
10. 旧魂骨 `age` 正确迁移为 `years`。
11. v2 输入经过 `ensurePlayerV2()` 不重复迁移。
12. 重复 `definitionId` 被验证器拒绝。
13. 重复 `evolutionFamilyId` 被验证器拒绝。
14. 重复武魂 slot 被拒绝。
15. `activeMartialSoulInstanceId` 悬空引用被拒绝。
16. 魂环 slot 在同一武魂中重复时被拒绝。
17. 当前战力计算测试仍全部通过。
18. 现有新游戏启动冒烟仍通过。

# 第五阶段：Event Schema v2 静态验证器

## 十五、开发目标

建议新增：

```text
js/event-schema-v2-validator.js
test/event-schema-v2-validator.test.js
data/v2/examples/
```

只验证数据，不执行流程，不修改 Player。

至少验证：

### Wheel

- wheel ID 唯一。
- item ID 在 wheel 内唯一。
- `weight` 必须为非负数字。
- 正式数据禁止 `null` 权重。
- `enabled` 类型正确。
- 至少存在一个可参与抽取的 item。
- `canonLevel` 为合法枚举。

### Advance

只允许：

```text
same_year
next_year
end
terminal
```

规则：

- `same_year` 需要合法目标，除非由 flow node 明确接管。
- `next_year` 必须指向可持久化 route node。
- `end` 不应携带无效目标。
- `terminal` 可以包含结束原因。
- 同一 item 不允许定义两套冲突跳转。

### Flow

- `entryNode` 存在。
- node ID 唯一。
- node 引用存在。
- `roll` 引用的 wheel 存在。
- `repeatWheel` 次数来源合法。
- `dispatchWheel` 有映射或 default。
- 所有循环节点声明限制。
- 所有路径存在到达停止状态的可能。
- 尚未支持的 op 给出明确错误，不静默忽略。

### Route

- lane 为合法枚举。
- `mutexGroups` 为字符串数组。
- `conflictPolicy` 为 `block | replace | branch`。
- entry node 存在。
- route node 引用存在。
- 同一互斥组配置格式统一。

### Trigger 与 Effects

- scope 和 op 为合法枚举。
- path 不能为空。
- effects 不允许直接写入 `combatPower`。
- effects 不允许修改由计算器派生的战力字段。
- Player v2 已知路径可进行基础检查。
- 动态实体路径无法静态确认时产生 warning，而不是伪造成功。

# 第六阶段：路线状态与 AnnualSession

## 十六、目标文件

建议新增：

```text
js/route-state.js
js/annual-session.js
test/route-state.test.js
test/annual-session.test.js
```

优先实现纯数据操作：

```js
createAnnualSession()
createRouteState()
canEnterRoute()
enterRoute()
advanceRoute()
completeRoute()
failRoute()
blockRoute()
```

不要操作 DOM，不负责抽转盘。

AnnualSession 最小结构：

```json
{
  "sessionId": "year_006_01",
  "age": 6,
  "seed": "example-seed",
  "status": "running",
  "spinCount": 0,
  "visitedNodes": {},
  "annualFlags": {},
  "spins": [],
  "warnings": [],
  "result": null
}
```

路线检查至少支持：

- 同一时间最多一条 `main`。
- 相同 route 不重复进入。
- mutex group 冲突。
- `block` 默认行为。
- `replace` 和 `branch` 暂时可以返回明确的“需要调用专用处理器”，不要自行编剧情。
- route 状态移动时不丢失 `data`、`flags`、`visitCounts`。

# 第七阶段：WheelFlowEngine 最小骨架

## 十七、实现范围

建议新增：

```text
js/wheel-flow-engine.js
test/wheel-flow-engine.test.js
data/v2/examples/wheels.minimal.json
data/v2/examples/flows.minimal.json
data/v2/examples/routes.minimal.json
```

第一版只要求完整支持：

```text
roll
same_year
end
```

同时为以下操作建立明确接口；尚未完成时必须抛出可识别错误：

```text
repeatWheel
dispatchWheel
next_year
terminal
```

如果前面阶段顺利，可以继续实现这四项，但不得为了实现它们批量迁移旧转盘。

Engine 职责：

- 接收 Player v2 或已经迁移后的状态。
- 接收 AnnualSession。
- 接收已通过验证器的数据。
- 使用可注入随机数生成器。
- 选择 wheel item。
- 应用明确允许的 effects。
- 记录 spinHistory。
- 处理 advance。
- 达到限制时停止并报告循环风险。
- 返回新状态和完整结果。
- 不操作 DOM。
- 不直接增加年龄。
- 不硬编码具体武魂、NPC或剧情。

运行限制：

```json
{
  "maxSpinsPerYear": 50,
  "maxVisitsPerNode": 5,
  "maxRepeatCount": 20,
  "maxRouteAdvancesPerAge": 10
}
```

单次节点必须原子执行：

```text
筛选候选
→ 验证权重
→ 消耗随机数
→ 确定 item
→ 验证 effects 与 next
→ 创建新状态
→ 写入 spin
```

任何一步失败时，不得留下半套状态修改。

# 第八阶段：最小战力 UI

## 十八、开发顺序判断

最小战力 UI 排在最后。

原因：

- UI 依赖 Player v2 的稳定读取结构。
- UI 依赖计算器输出。
- 当前运行时仍是 Player v1。
- 提前接 UI 会迫使项目保存重复兼容字段。

本阶段默认不修改生产页面。

如果前面所有阶段完成且现有 UI 接口适合，可以只新增一个只读方法：

```js
renderCombatPowerBreakdown(result)
```

输入必须是 `CombatPowerCalculator` 的返回结果，而不是在 UI 中重新计算 Player。

显示：

```text
总战力
等级战力
武魂品质
武魂真身
魂环
魂骨或神装
领域
属性
其他
warning
```

如果接入需要修改 Game、Player v1 或大量 HTML，本阶段跳过 UI，只报告原因。

# 第九阶段：测试与质量门槛

## 十九、完成前必须运行

至少运行：

```powershell
npm test
```

以及项目现有的：

- JSON解析检查。
- JavaScript语法检查。
- 文档JSON示例检查。
- 事件加载检查。
- 新游戏启动冒烟。
- `git diff --check`。

新增检查：

- Player v2 默认对象隔离。
- v1迁移不丢字段。
- Schema v2 验证器正反例。
- 路线互斥与主线路槽。
- AnnualSession 限制。
- WheelFlowEngine 固定随机种子的确定性。
- 战力原有测试仍通过。
- 99级与100级验收结果不回退。

# 第二十、禁止事项

本阶段继续禁止：

- 批量改写510个旧转盘。
- 根据 WheelID 自动生成正式剧情跳转。
- 把 `orderedWheelIds` 当作真实流程。
- 把“你选择”“你决定”解释为玩家主动选择。
- 给 Player 增加永久数值 `combatPower`。
- 允许 effects 修改派生战力。
- 擅自分配99级累计额外220点。
- 擅自确定其他 provisional 数值。
- 擅自补全神位、神器、称号、魂核和魂兽修为公式。
- 删除 Player v1 或现有兼容代码。
- 直接切换现有新游戏流程到 Player v2。
- 在 UI、Game、EventManager 中硬编码战力或流程规则。
- 大规模重构无关文件。
- 使用 `git add .` 混入负责人输入材料。

# 第二十一、建议的提交拆分

建议：

```text
feat: add player state v2 and migration adapter
feat: add event schema v2 validator
feat: add route state and annual session models
feat: add minimal wheel flow engine
feat: add read-only combat power UI
```

最后一项只有实际接入 UI 时才提交。每个提交前运行相关测试。

# 第二十二、完成报告格式

完成后请报告：

1. 当前分支和最新提交。
2. Day 10 提交是否已成功推送。
3. 新增和修改的文件。
4. Player v2 的最终最小结构。
5. v1 → v2 的具体迁移行为。
6. 为兼容 Player v1 保留了什么。
7. Event Schema v2 验证器支持了哪些规则。
8. 路线状态和 AnnualSession 支持了哪些操作。
9. WheelFlowEngine 已实现哪些 op，哪些仍明确未实现。
10. 是否接入最小战力 UI；未接入时说明原因。
11. 所有测试结果。
12. 是否发现文档与代码协议不一致。
13. 仍为 provisional 的内容。
14. 未暂存负责人输入材料是否保持未修改。
15. 下一步最小任务建议。
16. 建议的 Git push、commit 或 PR 命令。

测试失败时如实报告，不要修改预期值掩盖失败。
