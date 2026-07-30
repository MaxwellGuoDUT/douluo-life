# Event Schema v2 草案

状态：`draft`
目标：定义纯转盘叙事所需的 wheel、item、flow、route 与跨年推进协议，同时保留 Event Schema v1 的兼容入口。

## 1. 核心语义

- 所有年度活动、剧情“决定”和结果都由随机转盘解析。
- 文案中的“你选择”“你决定”不是玩家主动选项。
- 一年是一次可包含多个转盘的会话。
- 路线可以保存节点并跨年继续。
- 旧表与推断 JSON 是内容档案，不是正式运行图。
- 不根据相邻 WheelID 或 `orderedWheelIds` 自动建立正式跳转。

## 2. 公共枚举

### canonLevel

```text
canon
expanded
crossover
parody
```

适用于 wheel、item、flow、route 和 entity。过滤必须在候选池建立时完成。

### reviewStatus

```text
confirmed
inferred
provisional
deprecated
```

适用实体还可以携带来源信息：

```json
{
  "reviewStatus": "inferred",
  "confidence": "medium",
  "sourceRefs": [
    {
      "type": "legacy_wheel",
      "id": 57
    }
  ],
  "warnings": []
}
```

`confidence: "high"` 仍然只是推断置信度，不等于负责人已经确认。

### advance

```text
same_year
next_year
end
terminal
```

- `same_year`：在当前年度会话继续。
- `next_year`：保存流程或路线节点并结束本年；年龄仍由下一次 `Game.advanceYear()` 增加。
- `end`：结束本次年度转盘会话。
- `terminal`：结束角色一生。

## 3. Wheel

```json
{
  "schemaVersion": "event-schema/2.0-draft",
  "kind": "wheel",
  "id": "wheel_special_talent_gate",
  "title": "是否获得特殊天赋",
  "role": "gate",
  "resolution": "random_weighted",
  "canonLevel": "canon",
  "reviewStatus": "confirmed",
  "enabled": true,
  "trigger": {
    "age": {
      "eq": 6
    }
  },
  "tags": ["talent", "gate"],
  "items": [
    {
      "id": "yes",
      "text": "是",
      "weight": 1,
      "weightSource": "legacy_empty_default",
      "reviewStatus": "inferred",
      "canonLevel": "canon",
      "enabled": true,
      "trigger": {},
      "effects": {}
    },
    {
      "id": "no",
      "text": "否",
      "weight": 1,
      "weightSource": "legacy_empty_default",
      "reviewStatus": "inferred",
      "canonLevel": "canon",
      "enabled": true,
      "trigger": {},
      "effects": {}
    }
  ]
}
```

必需字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `schemaVersion` | string | 当前草案为 `event-schema/2.0-draft` |
| `kind` | string | 固定为 `wheel`，与 v1 event 和 flow/route 区分 |
| `id` | string | 全局唯一稳定 ID |
| `title` | string | 转盘标题，只用于叙事/展示 |
| `role` | string | `entry`、`gate`、`count`、`catalog`、`result`、`route_node` 等 |
| `resolution` | string | 第一阶段固定为 `random_weighted`，不得生成玩家选择按钮 |
| `canonLevel` | enum | 内容等级 |
| `reviewStatus` | enum | 内容确认状态 |
| `trigger` | object | 建池前的可用条件 |
| `items` | array | 至少一个 item |

`weight` 只在 wheel 本身作为候选入口时使用。若存在则必须为非负数且不能为 `null`。

## 4. Wheel Item

```json
{
  "id": "yes",
  "text": "是",
  "weight": 1,
  "weightSource": "legacy_empty_default",
  "reviewStatus": "inferred",
  "canonLevel": "canon",
  "enabled": true,
  "trigger": {},
  "effects": {},
  "next": {
    "advance": "same_year",
    "target": {
      "kind": "flow_node",
      "flowId": "special_talent_acquisition",
      "nodeId": "talent_count"
    }
  }
}
```

规则：

- `weight > 0` 参与抽取。
- `weight = 0` 保留但不参与抽取。
- `enabled: false` 明确停用。
- 正式 v2 运行数据禁止 `weight: null`。
- 旧表空权重迁移为 `1` 时必须写 `weightSource: "legacy_empty_default"` 与 `reviewStatus: "inferred"`。
- `effects` 必须存在；无效果写 `{}`。
- item 的 trigger 和 canonLevel 在抽取前过滤。
- `next` 只能引用明确存在的 flow/node/route/wheel；不能由 ID 相邻关系补全。
- `next` 是可选字段。由 gate 节点负责分流的 wheel item 不得再携带 `next`，避免双重跳转来源。

## 5. Trigger

Trigger 是候选池过滤协议。对象中的不同条件默认全部满足（AND）。

```json
{
  "age": {
    "gte": 15,
    "lte": 30
  },
  "attributes": {
    "level": {
      "gte": 40
    }
  },
  "state": {
    "faction": "武魂殿"
  },
  "nestedState": {
    "soulBones": {
      "external": null
    }
  },
  "hasEvent": ["event_id"],
  "hasTag": ["tag_id"],
  "hasRoute": ["route_id"],
  "routeState": {
    "route_id": {
      "nodeId": "node_id"
    }
  },
  "annualFlags": {
    "key": true
  },
  "routeFlags": {
    "route_id": {
      "key": true
    }
  }
}
```

数值比较符：

```text
gt
gte
lt
lte
eq
```

兼容层可以读取 v1 的 `age: 12`、`minAge`、`maxAge` 与 `min/max/equals`，但新 v2 数据使用统一比较对象。复杂 OR/NOT 条件在实现验证器前不进入正式数据，避免不同模块自行解释。

## 6. Effects

v2 延续 v1 的通用状态操作：

```json
{
  "effects": {
    "reputation": 2,
    "faction": {
      "set": "武魂殿"
    }
  }
}
```

支持：

- number：对 allowlist 中的数值状态增减；第一阶段为 `level`、`money`、`reputation`；
- `{ "set": value }`：设置状态；
- `{ "add": value }`：向 schema 注册的数组集合追加实体；
- `{ "setKey": { "key": string, "value": any } }`：设置 schema 注册的对象键。

v1 兼容 allowlist 继续包含 `spirit`、全局 `soulRings` 与 `soulBones`；它们不是 v2 多武魂数据的长期真源。Player v2 的嵌套实体写入协议确认前，正式 v2 数据不得用任意对象路径绕过 allowlist。

保护规则：

- `effects.age` 在 v2 禁止；年龄只由 `Game.advanceYear()` 修改。
- `effects.combatPower`、`effects.staticCombatPower`、`effects.effectiveCombatPower` 禁止；战力是派生值。
- 路线激活/替换不由普通 effects 暗中完成，应使用显式 route 操作并执行互斥检查。
- `routeFlags`、`annualFlags` 与会话临时值通过有作用域的流程操作写入，不把 v1 `setKey` 样例直接当作跨年状态协议。
- v1 兼容代码暂不删除；v2 验证器与适配层应和旧运行路径并存。

## 7. Flow

```json
{
  "schemaVersion": "event-schema/2.0-draft",
  "kind": "flow",
  "id": "special_talent_acquisition",
  "title": "特殊天赋获取",
  "canonLevel": "canon",
  "reviewStatus": "confirmed",
  "trigger": {},
  "entryNodeId": "talent_gate",
  "sessionLimits": {
    "maxSpins": 50,
    "status": "provisional"
  },
  "nodes": [
    {
      "id": "talent_gate",
      "op": "gate",
      "wheelId": "wheel_special_talent_gate",
      "saveAs": "hasSpecialTalent",
      "nextByItemId": {
        "yes": {
          "advance": "same_year",
          "target": {
            "kind": "flow_node",
            "flowId": "special_talent_acquisition",
            "nodeId": "talent_count"
          }
        },
        "no": {
          "advance": "end"
        }
      }
    },
    {
      "id": "talent_count",
      "op": "roll",
      "wheelId": "wheel_special_talent_count",
      "saveAs": "specialTalentCount",
      "next": {
        "advance": "same_year",
        "target": {
          "kind": "flow_node",
          "flowId": "special_talent_acquisition",
          "nodeId": "end"
        }
      }
    },
    {
      "id": "end",
      "op": "end"
    }
  ]
}
```

Flow 表达同一年内的连续随机流程。每个节点有唯一 `id` 与 `op`。第一阶段协议至少支持：

```text
roll
gate
repeatWheel
dispatchWheel
setRoute
yieldYear
end
terminal
```

引擎每执行一次抽取都记录 wheel、item、实际权重、随机种子和年度会话 ID。单年超过配置的 `sessionLimits.maxSpins` 时停止并报告循环。`50` 是当前防循环占位，不是已确认的平衡数值。

### Flow 上下文与写入作用域

`saveAs`、`countFrom`、`source` 默认都引用本次 flow 的临时 `sessionContext`：

```json
{
  "sessionContext": {
    "specialTalentCount": 2,
    "currentMartialSoulType": "tool"
  }
}
```

- `sessionContext` 在年度会话结束后丢弃，不自动成为 Player 永久字段。
- `annualFlags` 只在当年有效，由 `Game.advanceYear()` 清理。
- `routeFlags` 必须带 `routeId`，随该路线跨年保存。
- 只有明确的 `effects` 与 allowlist 可以写 Player 履历状态。
- 流程节点若写入非默认作用域，必须显式声明 `targetScope: "annual"` 或 `targetScope: "route"`；不得用任意 `saveAs` 路径修改 Player。

## 8. roll 与 gate

```json
{
  "id": "talent_gate",
  "op": "gate",
  "wheelId": "wheel_special_talent_gate",
  "saveAs": "hasSpecialTalent",
  "nextByItemId": {
    "yes": {
      "advance": "same_year",
      "target": {
        "kind": "flow_node",
        "flowId": "special_talent_acquisition",
        "nodeId": "talent_count"
      }
    },
    "no": {
      "advance": "end"
    }
  }
}
```

`roll` 抽取后使用所选 item 的 `next`；需要由 flow 按结果分流时使用 `gate`，且该 wheel 的 item 不得再定义 `next`。`nextByItemId` 使用稳定 item ID，不使用可能重复或改写的显示文本。推断文件中的 `roll.nextByResult` 在迁移时归一化为 `gate.nextByItemId`，不能让两种语法在正式数据中并存。gate 的结果仍来自转盘，不是界面按钮。

## 9. repeatWheel

```json
{
  "id": "talent_repeat",
  "op": "repeatWheel",
  "wheelId": "wheel_special_talent_catalog",
  "countFrom": "specialTalentCount",
  "uniqueBy": ["definitionId"],
  "onPoolExhausted": "warn_and_stop",
  "appendTo": "specialTalents",
  "next": {
    "advance": "same_year",
    "target": {
      "kind": "flow_node",
      "flowId": "special_talent_acquisition",
      "nodeId": "end"
    }
  }
}
```

规则：

- 次数必须来自已保存且经过范围校验的结果。
- `countFrom` 默认读取 `sessionContext`，不能直接读取任意 Player 路径。
- 去重通过稳定实体字段完成。
- 多武魂至少使用 `definitionId` 与 `evolutionFamilyId` 去重。
- 候选池耗尽后报告并停止，不允许无限重抽。

武魂定义与玩家实例使用不同 ID：

```json
{
  "entityDefinition": {
    "id": "clear_sky_hammer",
    "evolutionFamilyId": "hammer_clear_sky_family"
  },
  "playerInstance": {
    "instanceId": "martial_soul_slot_1",
    "definitionId": "clear_sky_hammer",
    "evolutionFamilyId": "hammer_clear_sky_family"
  },
  "activeMartialSoulInstanceId": "martial_soul_slot_1"
}
```

`definitionId` 和 `evolutionFamilyId` 用于防重复，`instanceId` 用于引用玩家持有的具体实例；显示名称不参与身份判定。

## 10. dispatchWheel

```json
{
  "id": "martial_soul_catalog",
  "op": "dispatchWheel",
  "source": "currentMartialSoulType",
  "wheelByResult": {
    "tool": "wheel_tool_martial_soul",
    "beast": "wheel_beast_martial_soul"
  },
  "onUnknownResult": "error",
  "saveAs": "currentMartialSoul",
  "next": {
    "advance": "same_year",
    "target": {
      "kind": "flow_node",
      "flowId": "martial_soul_generation",
      "nodeId": "return"
    }
  }
}
```

分派表必须显式列出稳定结果 ID 到 wheel ID 的映射。`onUnknownResult` 合法值为 `error`、`warn_and_end`、`fallback`；使用 `fallback` 时还必须提供 `fallbackWheelId`。`source` 默认读取 `sessionContext`。禁止根据 WheelID 顺序推断目录。

## 11. 合并池

15 岁特殊经历采用合并候选池，而不是条件二选一：

```json
{
  "id": "special_experience_repeat",
  "op": "repeatWheel",
  "countFrom": "specialExperienceCount",
  "pool": {
    "mode": "merge",
    "sources": [
      {
        "wheelId": "legacy_wheel_66_migrated",
        "poolMultiplier": 1,
        "trigger": {}
      },
      {
        "wheelId": "legacy_wheel_71_migrated",
        "poolMultiplier": 1,
        "trigger": {
          "age": {
            "gte": 15
          }
        }
      }
    ],
    "preserveItemWeights": true
  },
  "onPoolExhausted": "warn_and_stop",
  "appendTo": "specialExperiences",
  "next": {
    "advance": "end"
  }
}
```

先过滤来源和 item，再应用池倍率并抽取。年龄达到 15 时两个来源同时存在。

## 12. Route

```json
{
  "schemaVersion": "event-schema/2.0-draft",
  "kind": "route",
  "id": "route_clear_sky_core",
  "title": "昊天宗核心路线",
  "lane": "faction",
  "canonLevel": "canon",
  "reviewStatus": "provisional",
  "trigger": {},
  "entry": {
    "flowId": "clear_sky_route_flow",
    "nodeId": "entry"
  },
  "mutexGroups": ["major_faction_core"],
  "conflictPolicy": "block"
}
```

lane：

```text
main
faction
npc
deity
personal
temporary
```

同一时间最多一条 `main`。其他 lane 可以并存，但年度调度器只推进 trigger 满足且未被互斥阻止的路线。

`conflictPolicy`：

```text
block
replace
branch
```

默认 `block`。`replace`/`branch` 必须由已确认剧情显式声明。

建议的 Player v2 路线状态：

```json
{
  "activeRoutes": {
    "main": null,
    "faction": [],
    "npc": [],
    "deity": [],
    "personal": [],
    "temporary": []
  },
  "routeStates": {
    "route_id": {
      "nodeId": "next_node",
      "flags": {},
      "status": "active",
      "lastAdvancedYear": 12
    }
  },
  "annualFlags": {},
  "spinHistory": []
}
```

### 路线操作

`setRoute`：

```json
{
  "id": "activate_route",
  "op": "setRoute",
  "routeId": "route_clear_sky_core",
  "onBlocked": "warn_and_end",
  "next": {
    "advance": "next_year",
    "target": {
      "kind": "route_node",
      "routeId": "route_clear_sky_core",
      "nodeId": "first_year"
    }
  }
}
```

执行 `setRoute` 时必须在同一次原子更新中：

1. 检查 route trigger 和 canonLevel；
2. 检查 `main` 唯一性；
3. 检查所有 mutexGroups；
4. 按显式 `block`、`replace` 或 `branch` 策略更新 activeRoutes/routeStates；
5. 失败时不留下半激活状态。

`block` 不能覆盖旧路线；`replace` 必须保存被替换路线的结束原因；`branch` 必须保存父路线关系。

`yieldYear` 等价于 `advance: "next_year"`，要求提供持久 route target；`end` 等价于 `advance: "end"`，只结束年度会话；`terminal` 等价于 `advance: "terminal"`，还要记录终局原因。三者都不得修改年龄。

## 13. next 与 advance

`next` 是带互斥 target 的统一跳转对象：

```json
{
  "next": {
    "advance": "same_year",
    "target": {
      "kind": "flow_node",
      "flowId": "flow_id",
      "nodeId": "node_id"
    }
  }
}
```

路线跨年：

```json
{
  "next": {
    "advance": "next_year",
    "target": {
      "kind": "route_node",
      "routeId": "route_id",
      "nodeId": "next_year_node"
    }
  }
}
```

终止：

```json
{
  "next": {
    "advance": "terminal"
  }
}
```

`target.kind` 合法值：

- `flow_node`：必须有 `flowId` 与 `nodeId`；
- `route_node`：必须有 `routeId` 与 `nodeId`；
- `wheel`：必须有 `wheelId`，且只允许 `same_year`。

一个 `next` 只能包含一个 target。`same_year` 必须有可执行 target；`next_year` 必须指向持久 route node；`end` 与 `terminal` 不得携带 target。单独的 `nodeId` 不具有“当前 flow”隐式含义。

## 14. 年度调度边界

```text
Game.advanceYear()
→ age + 1
→ 清理 annualFlags
→ 创建并保存年度随机种子
→ 调度可推进的 activeRoutes
→ EventManager 建立并抽取年度入口池
→ WheelFlowEngine 执行 same_year 节点
→ 遇到 next_year/end/terminal 停止
→ 保存年度历史和 spinHistory
```

`WheelFlowEngine` 永远不直接增减年龄。

## 15. 迁移与兼容

- `EVENT_SCHEMA.md` v1 保留，不覆盖。
- 旧事件可继续由现有 `EventManager` 加载。
- v2 wheel/flow/route 在验证器和引擎完成前不直接替换旧事件文件。
- `schemaVersion` 与 `kind` 用来区分 v1 `next: []` 和 v2 `next: {}`，严格加载器不得猜测字段含义。
- 推断流程中的 `repeatSubflow`、`repeatWheelByCondition` 与 `return` 暂时只作为参考语法；正式支持前必须定义作用域、fallback、返回栈和循环限制，不能直接投入运行。
- v1 `spirit`/全局 `soulRings` 与 v2 `martialSouls[].soulRings` 不能同时作为真源；迁移适配器应明确选择来源并报告冲突。
- reference 层允许保留 `effects: null` 和 `weight: null` 取证，authoritative v2 运行层必须使用 `{}` 和非负数权重。
- 旧空权重只在复制到新的正式 v2 数据时迁移，不回写只读转换结果。
- 所有推断连接保留证据、置信度与 `reviewStatus: "inferred"`，人工确认后才能成为正式 `next`。
