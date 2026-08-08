# 战力系统 v1.0 草案

状态：第一阶段基础设施
规则配置：`data/config/combat-power.json`
纯函数实现：`js/combat-power.js`

## 1. 定位与职责

战力是角色履历的派生评分，不是可被事件永久加减的 Player 数值。

```js
const result = CombatPowerCalculator.calculate(player, rules);
```

返回结构：

```json
{
  "total": 2067,
  "breakdown": {
    "level": 760,
    "martialSoulQuality": 228,
    "martialSoulAvatar": 228,
    "soulRings": 262,
    "soulBones": 270,
    "divineArmor": 0,
    "domains": 152,
    "attributes": 167,
    "soulCore": 0,
    "deity": 0,
    "artifacts": 0,
    "titles": 0,
    "other": 0
  },
  "warnings": [],
  "rulesVersion": "combat-power/1.0"
}
```

计算器不访问 DOM、不修改 Player、不读取人物姓名，也不把总战力写回 Player。

## 2. 基础战力模式

```json
{
  "combatBase": {
    "mode": "level"
  }
}
```

合法模式：

- `level`：普通人类魂师，本阶段已实现。
- `soul_beast_cultivation`：未化形魂兽，预留。
- `hybrid`：化形魂兽或半人半魂兽，必须有专用规则，预留。

不能默认把人类等级和魂兽修为年限相加。第一阶段遇到后两种未配置模式时应报告 warning，而不是猜测公式。

## 3. 等级战力

等级范围为 1 至 169。连续曲线：

```js
const decade = Math.floor((level - 1) / 10);
const remainder = level - decade * 10;
const continuousPower =
    5 * decade * (decade + 1) +
    remainder * (decade + 1);
```

```text
等级战力
= 连续等级成长
+ 境界突破奖励
+ 特殊等级节点奖励
```

连续曲线锚点：

| 等级 | 连续曲线 |
| ---: | ---: |
| 10 | 10 |
| 20 | 30 |
| 30 | 60 |
| 99 | 540 |
| 100 | 550 |
| 169 | 1513 |

剧情锚点为 99 级 `760`、100 级 `1260`。两者共同依赖尚未分配的累计额外 `220` 点。正式配置不会把这 220 点藏入公式，而是让验证器报告 `LEVEL_ANCHOR_UNRESOLVED`。

100 级额外 `490` 点作为达到该节点后累计生效的显式 `specialLevelBonuses` 配置，状态为 `provisional`。验收夹具会在独立的 `cumulativeBonusAnchors` 中注入 `220` 点临时累计锚点，字段同时标记 `fixtureOnly`、`allocationStatus: "unallocated"` 和 `provisional`；它只表示截至 99 级的累计差额，不表示 220 点在 99 级一次发放。

## 4. 武魂品质与武魂真身

武魂品质：

```text
round(等级战力 × min(所有已知品质系数之和, 系数上限))
```

当前有依据的系数：

```text
top = 0.25
extreme = 0.30
```

其他品质没有确认数值，不补表；未知枚举产生 warning 且不贡献战力。

武魂真身：

```text
70 级以下 = 0
70 级及以上 = round(等级战力 × 当前激活武魂真身系数)
```

多武魂只计算 `activeMartialSoulInstanceId` 指向的一个武魂实例真身；`definitionId` 与 `evolutionFamilyId` 继续负责定义/族谱去重。品质和真身各自只以等级战力为基数，不互相复利。

## 5. 魂环

普通魂环先按年限查基础战力：

| 年限 | 基础战力 |
| --- | ---: |
| 10–99 | 1 |
| 100–499 | 3 |
| 500–999 | 5 |
| 1,000–4,999 | 8 |
| 5,000–9,999 | 11 |
| 10,000–49,999 | 16 |
| 50,000–99,999 | 21 |
| 100,000–199,999 | 30 |
| 200,000–299,999 | 40 |
| 300,000–399,999 | 50 |
| 400,000–499,999 | 60 |
| 500,000–599,999 | 70 |
| 600,000–699,999 | 80 |
| 700,000–799,999 | 90 |
| 800,000–899,999 | 100 |
| 900,000–999,999 | 110 |
| 1,000,000+（非神级金色） | 200 |

魂兽血脉字段统一为 `soulBeastBloodlineGrade`：

```text
low = 0.1
ordinary = 1.0
top = 2.0
sub_dragon = 2.0
earth_dragon = 2.0
pure_dragon = 3.0
```

普通魂环：

```js
Math.max(1, Math.round(basePower * bloodlineMultiplier))
```

`top`、`sub_dragon`、`earth_dragon` 即使当前倍率相同也保留不同枚举。1 至 9 年魂环当前非法，报告 warning 并跳过，不自动改成年限 10。

神级金色魂环固定为 `1000`，忽略血脉倍率。神赐魂环使用 `sourceType: "god_bestowed"` 与显式 `qualityMultiplier`，不伪造天然魂兽血脉。

## 6. 魂骨与神装

普通魂骨暂时复用魂环年限表和血脉倍率，单件最低为 1。

```text
普通魂骨战力 = round(年限基础战力 × 血脉倍率)
```

神装部件替换原魂骨战力：

```text
神装部件战力 = round(原魂骨战力 × divineMultiplier)
```

当前案例倍率 `3` 标记为 `provisional`。`equipmentState: "divine_armor"` 的部件只进入 `divineArmor` 小计，不再进入 `soulBones`。套装奖励由显式套装定义独立加入神装小计；不会在代码里隐藏补差。

外附魂骨/神装继续作为第七部位。

## 7. 领域、属性与预留模块

领域和属性分别先合并系数，再对小计四舍五入：

```text
领域 = round(等级战力 × 所有领域系数之和)
属性 = round(等级战力 × 所有属性系数之和)
```

所有百分比模块都只以等级战力为基准，禁止链式复利。

魂核、神位、神器、称号和其他明确来源使用“Player 保存实体引用、规则配置保存贡献公式”的通用接口。基础配置不擅自提供完整实体表；验收案例所需条目只在测试夹具中显式注入，并标记为 `provisional`。

## 8. 舍入与错误处理

- JavaScript `Math.round` 逐件计算魂环、魂骨和神装。
- 武魂品质、领域、属性先合并系数，再舍入小计。
- 每项小计与总战力均为不小于 0 的自然数。
- 非法等级属于无法继续计算的输入错误。
- 非法魂环/魂骨年限、未知血脉、未知品质、缺失实体定义会产生结构化 warning；对应无效项不参与小计。
- 配置验证器检查年限区间、枚举倍率、规则版本以及等级锚点。

## 9. 验收案例

### 99 级常规极限斗罗

验收夹具显式注入未分配的 `+220 provisional`，得到等级战力 `760`。

```text
魂环：6 + 10 + 16 + 22 + 32 + 32 + 42 + 42 + 60 = 262
魂骨：42 + 42 + 42 + 42 + 60 + 42 = 270
总和：760 + 228 + 228 + 262 + 270 + 152 + 167 = 2067
```

### 100 级海神唐三验收锚点

验收夹具使用显式、可审计的 provisional 实体规则，不把人物名写入计算器：

```text
level                 1260
martialSoulQuality     630
martialSoulAvatar      315
soulRings             3520
divineArmor           3200
domains                378
attributes             865
soulCore                 0
deity                 2520
artifacts              800
other                  800
total                14288
```

任务书没有提供上述魂环与神装小计唯一对应的逐件履历。测试使用以下最小重建，并整体标记为 `provisional fixture reconstruction`：

```text
武魂一魂环：9 × 100000年顶级血脉(60) + 1 × 神级金色(1000) = 1540
昊天锤魂环：3 × 100000年(60) + 5 × 200000年(80)
            + 1 × 1000000年非神级(400) + 1 × 神级金色(1000)
            = 1980
魂环总计：1540 + 1980 = 3520

原魂骨：4 × 60 + 2 × 80 + 1 × 400 = 800
七件神装：800 × 3 = 2400
显式套装奖励：800
神装总计：3200
```

其中 `40 × 200% = 80`。领域夹具系数合计 `0.30`；属性夹具为尚未拆分的聚合系数 `0.6865`；神位、神器和 other 分别使用 `等级战力 × 2`、固定 `800`、固定 `800` 的具名测试规则。完整神位、神器、神装和属性目录仍未建立，这些案例规则不是正式人物履历或平衡表。

## 10. 战斗接口边界

```text
静态总战力
→ 伤势、地形、克制、援助等现场修正
→ 本场有效战力
→ 双方差距映射为结果转盘权重修正
→ 转盘决定战斗结果
```

第一阶段只计算 `staticCombatPower`。有效战力和权重映射留到后续版本。

## 11. UI 决策

当前 Player v1 只有单个字符串 `spirit`，魂环/魂骨也缺少血脉、来源和实体 ID。直接在页面显示一个看似精确的总战力会产生误导，因此本轮不修改现有页面布局。

最小展示接口是 `CombatPowerCalculator.calculate(player, rules)` 的返回值；待 Player v2 能表达计算所需状态后，UI 只渲染该结果，不复制公式。
