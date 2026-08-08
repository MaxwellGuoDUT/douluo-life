# Player State v2

状态：第一阶段运行基础

Player v2 与现有 `js/player.js` 并行存在。现有 Game、EventManager、Effects 和 UI 继续使用 Player v1；本阶段不切换新游戏入口。

## 1. 基础结构

```json
{
  "schemaVersion": "player/2.0",
  "name": "主角",
  "age": 0,
  "level": 1,
  "rank": "未觉醒",
  "combatBase": {
    "mode": "level"
  },
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

Player v2 禁止保存：

```text
combatPower
staticCombatPower
effectiveCombatPower
```

也不保存可变的 `spirit`、顶层 `soulRings` 或第二份 `activeRoutes` 镜像。

## 2. 武魂与魂环

武魂定义 ID、玩家实例 ID 和进化族谱 ID 分离：

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

- `instanceId`、非空 `definitionId`、非空 `evolutionFamilyId` 和 `slot` 分别唯一。
- 未解析旧武魂保留 `definitionId: null`、`evolutionFamilyId: null` 和 `legacyName`。
- `activeMartialSoulInstanceId` 只能引用现有实例。
- 正式魂环只存放在对应的 `martialSouls[].soulRings`。
- `qualityGrade` 与 `avatarGrade` 是战力计算器可读取的可选扩展；迁移器不根据旧武魂名称推断它们。

魂环：

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

`normal` 是 Player v2 的普通魂环状态值；战力计算器将其归一化为非神级年限表语义。神级金色使用 `divine_gold`，神赐使用 `sourceType: "god_bestowed"`。

## 3. 魂骨

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

`equipmentState` 第一阶段允许 `soul_bone` 与 `divine_armor`。神装替换同一部位的普通魂骨战力；套装奖励不写入单件魂骨。

## 4. v1 迁移

`migratePlayerV1ToV2(playerV1)` 返回：

```json
{
  "player": {},
  "warnings": []
}
```

迁移规则：

- 基础字段和 history 深复制。
- 旧 `spirit` 字符串变为 `ms_legacy_1`，保留在 `legacyName`，不猜测正式实体 ID。
- 旧顶层魂环移动到第一个武魂，`age` 改为 `years`。
- 没有武魂但有魂环时建立未解析占位实例，并产生 warning。
- 孤立魂环占位实例不自动成为激活武魂，`activeMartialSoulInstanceId` 保持 `null`。
- 旧魂骨 `age` 改为 `years`；未知血脉、来源和定义保持未解析。
- 七个标准槽位之外的旧魂骨扩展槽位保存在 `flags.legacyUnrecognizedSoulBoneSlots` 并逐项 warning，不静默丢弃。
- 同时存在且冲突的 `age`、`years` 优先保留 `years`，原值证据写入实体迁移 flags 并产生 warning。
- 未知旧字段深复制到 `flags.legacyUnrecognizedFields`，并逐项产生 warning。
- 旧派生战力字段只产生丢弃 warning，不进入 Player v2 或迁移 metadata。
- 输入对象不被修改；同一输入得到稳定结果。

`ensurePlayerV2()` 对合法 v2 输入只做校验和深复制，不重复迁移或创建第二份武魂/魂环。未知 `schemaVersion` 会明确拒绝，不按 v1 猜测。

## 5. 兼容读取

`player-selectors.js` 提供：

```text
getPrimaryMartialSoul
getPrimaryMartialSoulName
getSoulRingsForMartialSoul
getPrimarySoulRings
getActiveRoutes
```

选择器接受 v1 或 v2，返回深复制的只读结果，不通过 setter 建立实体，也不在 v2 中保存旧字段镜像。

## 6. 验证边界

`validatePlayerV2()` 检查：

- schema 版本和派生战力禁用字段；
- 顶层旧字段镜像；
- 武魂实例、定义、族谱和 slot 唯一性；
- 激活武魂与魂骨绑定引用；
- 同一武魂中的魂环 slot；
- 魂环类型、血脉枚举和神赐倍率；
- 七个魂骨部位与神装状态；
- routeStates、annualFlags、spinHistory 等容器形状；
- route ID 跨 bucket 唯一、状态与 bucket 一致，以及最多一条活动主线。

未解析的旧武魂、魂环年限或魂骨年限产生 warning；结构冲突产生 error。

路线互斥组和 `block | replace | branch` 策略不由 Player schema 判断，交给独立路线状态模块处理。
