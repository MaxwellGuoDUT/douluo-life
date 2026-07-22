# Event Schema v1.0

版本：v1.0

用途：
定义斗罗人生模拟器中的事件数据格式。

适用范围：
出生、成长、武魂觉醒、学院、战斗等人生事件。

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
    "effects": {
        "luck": 5
    },
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
| trigger | object | 事件触发条件，例如年龄、地点、属性、已发生事件 |
| tags | array | 事件标签 |
| effects | object | 事件产生的数值效果，必须保留，允许为空对象 |
| weight | number | 随机权重 |
| next | array | 后续事件 |

## Effects 规范

`effects` 统一采用对象格式：

```json
{
    "effects": {
        "luck": 5,
        "power": 2,
        "hp": -10
    }
}
```

执行结果等价于：

```js
player.luck += 5;
player.power += 2;
player.hp -= 10;
```

### 规则

1. `effects` 必须存在，且必须是 object。
2. 没有效果时写作 `"effects": {}`，禁止省略字段。
3. key 必须与 `Player` 已有属性完全一致，大小写敏感。
4. v1.0 仅支持数值属性修改。目标 Player 属性必须是 number。
5. value 必须是 number，允许正数、负数和 0。
6. 正数表示增加，负数表示减少。
7. 一个事件允许同时修改多个属性。
8. Game 必须用统一遍历方式执行 effects，不为单个属性编写专门逻辑。

当前可用于数值效果的 Player 属性包括：

```text
age
level
hp
power
agility
intelligence
luck
```

暂不支持 `name`、`spirit`、装备、背包、金币、魂环、NPC、Buff / Debuff、概率效果、自定义脚本等复杂效果。

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
battle_001
```

不要使用：

```text
event001
event002
```
