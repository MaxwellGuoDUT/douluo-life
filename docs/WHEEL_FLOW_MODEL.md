# 纯转盘人生流程模型

> **HISTORICAL DESIGN INPUT**：本文是 Wheel Flow 的早期规划输入，包含尚未实现或已被后续模型替代的字段与操作。当前有效语义以 `docs/DECISION_RECORD_V2.md`、`docs/EVENT_SCHEMA_V2_DRAFT.md`、实际代码和测试为准。

版本：草案 v0.1

## 目标

项目不是传统 RPG，也不是让玩家在事件选项中主动做决定。

角色的一生由转盘决定：

1. 每年先抽取当年的活动或剧情入口。
2. 入口可能直接产生结果，也可能进入复合转盘流程。
3. 复合流程可以继续触发门槛、数量、目录、结果或剧情节点转盘。
4. 选中的结果修改角色履历，并决定下一个转盘或下一年的剧情状态。
5. 最终进入封号斗罗、神考、自创神位、飞升或死亡等终点。

## 一年不是一次转盘，而是一次转盘会话

一次年度结算可以包含多个连续步骤：

```text
年度入口转盘
  → 是否获得特殊天赋
    → 是
      → 特殊天赋数量
        → 重复抽取特殊天赋
  → 记录结果
  → 本年结束
```

剧情路线则可以跨年：

```text
年度入口转盘
  → 是否进入分支剧情
    → 是
      → 设置 activeRoute
      → 抽取本路线当前剧情节点
      → 保存 routeNode
      → 下一年继续路线
```

因此需要区分：

- `same_year`：在同一年继续转下一个轮盘；
- `next_year`：保存路线状态，下一年再继续；
- `end`：本次会话结束；
- `terminal`：角色一生结束。

## 转盘数据

建议把 v1 的单事件改成转盘与选项两层：

```json
{
  "id": "wheel_special_talent_gate",
  "title": "是否获得特殊天赋",
  "role": "gate",
  "trigger": {
    "age": 6
  },
  "weight": 100,
  "items": [
    {
      "id": "yes",
      "text": "是",
      "weight": 20,
      "effects": {
        "flags": {
          "setKey": {
            "key": "hasSpecialTalent",
            "value": true
          }
        }
      },
      "next": {
        "flow": "special_talent_acquisition",
        "node": "talent_count",
        "advance": "same_year"
      }
    },
    {
      "id": "no",
      "text": "否",
      "weight": 80,
      "effects": {},
      "next": {
        "advance": "end"
      }
    }
  ]
}
```

这里的两个结果仍然都是转盘随机结果，不是玩家按钮。

## 复合流程节点

流程引擎至少需要支持以下操作：

| 操作 | 用途 |
| --- | --- |
| `roll` | 转动一个指定轮盘并保存结果 |
| `gate` | 根据转盘结果进入不同节点 |
| `repeatWheel` | 按另一个转盘给出的次数重复抽取 |
| `dispatchWheel` | 根据类别进入对应目录转盘 |
| `setRoute` | 进入持久剧情路线 |
| `yieldYear` | 保存状态并结束本年 |
| `end` | 结束本次转盘会话 |
| `terminal` | 结束角色一生 |

为避免配置错误，单年应设置最大转盘次数，例如 50 次；超过后终止会话并报告流程循环。

## 路线状态

角色需要保存少量流程状态，而不是传统四维属性：

```js
{
    age: 6,
    activeRoute: "route_mask_beauty",
    routeNode: "academy_arrival",
    routeFlags: {},
    annualFlags: {},
    spinHistory: []
}
```

- `activeRoute`：当前跨年剧情路线。
- `routeNode`：下一年从哪个节点继续。
- `routeFlags`：当前路线中的关键结果。
- `annualFlags`：本年临时数据，年度结束后清理。
- `spinHistory`：记录每次转盘、结果、权重与随机种子。

## 权重规则

新项目中禁止空权重。

建议统一规定：

- `weight > 0`：参与抽取；
- `weight = 0`：保留但不参与抽取；
- `enabled: false`：明确停用；
- 同一轮盘权重不要求总和为 100，只作为相对权重；
- 所有抽取使用可保存的随机种子，便于复盘和测试。

旧表的空权重必须经过人工确认后才能进入正式数据。

## 武魂差异化

武魂不需要变成传统 RPG 的攻击、防御、敏捷数值表。差异应主要体现在“可以进入哪些转盘、如何成长、会触发什么路线”。

建议的武魂实体结构：

```json
{
  "id": "clear_sky_hammer",
  "name": "昊天锤",
  "form": "tool",
  "grade": "top",
  "rarity": "rare",
  "tags": [
    "hammer",
    "strength",
    "clear_sky_sect"
  ],
  "affinities": [
    "power"
  ],
  "growthRules": [
    "heavy_weapon_ring_pool",
    "explosive_ring_route"
  ],
  "mutationPool": "wheel_clear_sky_hammer_mutation",
  "routeHooks": [
    "route_clear_sky_sect",
    "route_tang_hao_attention"
  ]
}
```

武魂的区别可拆成五个层面：

1. **形态**：器、兽、植物、本体、食物等，决定基础目录和部分魂环池。
2. **品质**：普通、高级、顶级、极致、神级，决定稀有度和可进入的成长路线。
3. **特征标签**：力量、敏攻、控制、治疗、毒、火、冰、精神、空间等。
4. **成长规则**：可获得的魂环池、二次觉醒、血脉进化、武魂变异和融合可能。
5. **剧情钩子**：宗门关注、NPC反应、专属机缘、神考或特殊结局。

这样即使两个武魂初始结果都只是“获得一个武魂”，后续可抽取的转盘集合也会不同。

## 多武魂

`spirit` 应从单个字符串升级为数组：

```js
martialSouls: [
    {
        id: "clear_sky_hammer",
        slot: 1,
        awakenedAge: 6,
        soulRings: [],
        mutations: [],
        sealed: false
    }
]
```

每个武魂独立保存魂环、变异、封印和进化状态。角色总等级仍然只有一套，不建立多套传统 RPG 属性。

## 与当前架构的关系

现有 `EventManager` 可以继续负责：

- 根据年龄、履历和状态筛选年度入口；
- 按权重选出本年入口。

需要新增 `WheelFlowEngine`：

1. 接收年度入口或当前剧情路线；
2. 按流程节点连续转动轮盘；
3. 应用每次结果的效果；
4. 处理重复、分派和跳转；
5. 遇到 `yieldYear`、`end` 或 `terminal` 时停止；
6. 返回完整的本年转盘记录供界面播放。

旧表适合用来学习“有哪些轮盘与路线”，不应直接决定新项目的正式节点连接。
