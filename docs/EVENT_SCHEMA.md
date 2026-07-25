# Event Schema v1.0

版本：v1.0

用途：
定义斗罗人生模拟器中的事件数据格式。

适用范围：
出生、成长、武魂觉醒、学院、魂环、魂骨、势力、结局等人生事件。

## 基础结构

```json
{
    "id": "birth_001",
    "title": "出生",
    "text": "你降临到了斗罗大陆。",
    "trigger": {
        "age": 0
    },
    "tags": [
        "birth",
        "milestone"
    ],
    "effects": {},
    "weight": 100,
    "next": []
}
```

## 字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 事件唯一编号 |
| title | string | 事件标题 |
| text | string | 事件文本 |
| trigger | object | 事件触发条件 |
| tags | array | 事件标签 |
| effects | object | 事件产生的状态变化，必须保留，允许为空对象 |
| weight | number | 随机权重 |
| next | array | 后续事件 |

## Effects 规范

事件只通过 `effects` 修改 Player 状态。

```json
{
    "effects": {
        "money": 5,
        "reputation": 2,
        "spirit": {
            "set": "蓝银草"
        },
        "soulRings": {
            "add": {
                "age": 120,
                "tier": "百年"
            }
        },
        "soulBones": {
            "setKey": {
                "key": "external",
                "value": {
                    "age": 1000,
                    "tier": "千年",
                    "name": "外附魂骨"
                }
            }
        }
    }
}
```

执行结果等价于：

```js
player.money += 5;
player.reputation += 2;
player.spirit = "蓝银草";
player.soulRings.push({ age: 120, tier: "百年" });
player.soulBones.external = { age: 1000, tier: "千年", name: "外附魂骨" };
```

### Effects 规则

1. `effects` 必须存在，且必须是 object。
2. 没有效果时写作 `"effects": {}`，禁止省略字段。
3. key 必须与 `Player` 已有属性完全一致，大小写敏感。
4. value 为 number 时表示数值增减，目标 Player 属性必须是 number。
5. value 为 `{ "set": any }` 时表示直接设置属性值。
6. value 为 `{ "add": any }` 时表示向数组属性追加一项。
7. value 为 `{ "setKey": { "key": string, "value": any } }` 时表示设置对象属性中的一个部位。
8. 一个事件允许同时修改多个属性。
9. Game 必须用统一遍历方式执行 effects，不为单个属性编写专门逻辑。

当前可用于 number 效果的 Player 属性：

```text
age
level
money
reputation
```

当前可用于 set 操作的 Player 属性：

```text
spirit
academy
rank
title
faction
```

当前可用于 add 操作的 Player 属性：

```text
soulRings
```

当前可用于 setKey 操作的 Player 属性：

```text
soulBones
```

## Trigger 规范

`trigger` 统一采用对象格式，用来判断事件是否可以发生。

```json
{
    "trigger": {
        "age": 12,
        "attributes": {
            "money": {
                "gte": 100
            }
        },
        "state": {
            "rank": "魂师"
        },
        "nestedState": {
            "soulBones": {
                "external": null
            }
        },
        "hasTag": [
            "soul_ring"
        ]
    }
}
```

### 当前支持字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| age | number | 玩家年龄必须等于该值 |
| minAge | number | 玩家年龄必须大于或等于该值 |
| maxAge | number | 玩家年龄必须小于或等于该值 |
| attributes | object | 玩家数值属性条件 |
| state | object | 玩家状态必须等于指定值 |
| nestedState | object | 玩家一层嵌套状态必须等于指定值 |
| hasEvent | array | 玩家历史中必须发生过指定事件 id |
| hasTag | array | 玩家历史中必须发生过指定标签事件 |

### attributes 写法

推荐写法：

```json
{
    "attributes": {
        "money": {
            "gte": 100
        },
        "level": {
            "eq": 10
        }
    }
}
```

兼容旧写法：

```json
{
    "attributes": {
        "money": {
            "min": 100,
            "max": 300,
            "equals": 200
        }
    }
}
```

| 字段 | 含义 |
| --- | --- |
| gt | 大于 |
| gte | 大于或等于 |
| lt | 小于 |
| lte | 小于或等于 |
| eq | 等于 |

### Trigger 规则

1. `trigger` 必须存在，且必须是 object。
2. 多个 trigger 条件同时存在时，必须全部满足才允许事件触发。
3. `age` 适合固定年龄事件，例如出生、武魂觉醒、首次魂环。
4. `minAge` / `maxAge` 适合一段年龄内可发生的随机事件。
5. `attributes` 仅支持 Player 数值属性。
6. `state` 支持严格相等判断，可用于 `spirit: null`、`rank: "魂师"`。
7. `nestedState` 支持一层嵌套状态判断，可用于 `soulBones.external: null`。
8. `hasEvent` 与 `hasTag` 必须写成数组。
9. `EventManager` 会先筛选全部可触发事件，再根据 `weight` 随机选择一个事件。

## Player State v1.0

Player 是人生模拟的状态容器。当前游戏采用转盘叙事，不使用传统 RPG 四维属性。

```js
{
    name: "主角",
    age: 0,
    level: 1,
    rank: "未觉醒",
    spirit: null,
    soulRings: [],
    soulBones: {
        head: null,
        torso: null,
        leftArm: null,
        rightArm: null,
        leftLeg: null,
        rightLeg: null,
        external: null
    },
    academy: null,
    faction: null,
    title: "平民",
    money: 0,
    reputation: 0,
    history: []
}
```

### 状态职责

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 玩家姓名 |
| age | number | 年龄 |
| level | number | 等级 |
| rank | string | 境界 |
| spirit | string / null | 武魂 |
| soulRings | array | 魂环列表 |
| soulBones | object | 魂骨部位 |
| academy | string / null | 学院 |
| faction | string / null | 所属势力 |
| title | string | 身份称号 |
| money | number | 金钱 |
| reputation | number | 声望 |
| history | array | 人生事件记录 |

### 魂环结构

```js
{
    age: 120,
    tier: "百年"
}
```

魂环年限大等阶：

```text
10-99：十年
100-999：百年
1000-9999：千年
10000-99999：万年
100000+：十万年
```

### 魂骨结构

```js
{
    age: 1000,
    tier: "千年",
    name: "外附魂骨"
}
```

魂骨部位：

```text
head
torso
leftArm
rightArm
leftLeg
rightLeg
external
```

## ID 规范

格式：

```text
事件类型_编号
```

例如：

```text
birth_001
spirit_001
academy_001
cultivation_001
```

不要使用：

```text
event001
event002
```
