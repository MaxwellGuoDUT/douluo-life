# Event Schema v1.0
版本：v1.0

用途：
定义斗罗人生模拟器中的事件数据格式。

适用范围：
出生、成长、武魂觉醒、学院、战斗等人生事件。

## 基础结构


```json
{
    "id": "spirit_awaken_001",

    "title": "武魂觉醒",

    "text": "六岁的你来到武魂殿，迎来人生第一次武魂觉醒。",

    "trigger": {
        "age": 6
    },

    "tags": [
        "spirit",
        "milestone"
    ],

    "effects": {
        "spirit": "unknown"
    },

    "weight": 100,

    "next": []
}
```

## 字段说明

| 字段      | 类型     | 说明     |
| ------- | ------ | ------ |
| id      | string | 事件唯一编号 |
| title   | string | 事件标题   |
| text    | string | 事件文本   |
| trigger | object | 事件触发条件，例如年龄、地点、属性、已有事件 |

| tags    | array  | 事件标签   |
| effects | object | 产生效果   |
| weight  | number | 随机权重   |
| next    | array  | 后续事件   |


## ID 规范
格式：

事件类型_编号
例如：

birth_001
spirit_001
academy_001
battle_001

不要：

event001
event002
