# Codex 下一阶段总任务书：Event Schema v2、WheelFlowEngine 与战力系统

> **HISTORICAL PLANNING INPUT**：本文保留早期 V2 规划与负责人输入，不是当前开发指令；当前状态以代码、测试和现行真相源文档为准。

项目：斗罗大陆魂师人生转盘模拟器  
技术栈：HTML、CSS、原生 JavaScript  
工作原则：数据驱动、模块分离、纯转盘叙事、暂不大规模重写旧代码

---

## 一、先阅读这些文件

请先阅读并理解：

1. `AI_CONTEXT.md`
2. `EVENT_SCHEMA.md`
3. `WHEEL_FLOW_MODEL.md`
4. `conversion_report.json`
5. `flows.inferred.json`
6. `routes.inferred.json`
7. 必要时抽查 `wheels.normalized.json`

必须遵守：

- 游戏没有传统 RPG 式的玩家主动选择。
- 文案中的“你选择”“你决定”只是随机结果的叙事表达。
- 一年可以连续执行多个转盘。
- 剧情路线允许跨年保存。
- 不得把 `orderedWheelIds` 或相邻 WheelID 直接当成真实剧情跳转图。
- 旧表是内容档案和推断来源，不是可直接运行的正式流程数据。

---

## 二、已经由项目负责人确认的决策

### 1. 旧表空权重

正式接受：

```text
旧表空权重默认迁移为 1
```

迁移后必须保留来源：

```json
{
  "weight": 1,
  "weightSource": "legacy_empty_default",
  "reviewStatus": "inferred"
}
```

其他规则：

- 正数权重保留原值。
- 零权重保持 `0`，不参与抽取。
- Event Schema v2 正式运行数据中禁止出现 `null` 权重。
- 不要直接覆盖只读的旧转换结果。

### 2. 路线并发

采用：

```text
一条主线 + 多条支线
```

路线至少支持以下 lane：

```text
main
faction
npc
deity
personal
temporary
```

同一时间最多一条 `main` 路线。其他支线能否同时推进，由 trigger、互斥组和年度调度决定。

### 3. 多武魂重复

禁止重复：

- 不允许重复获得同一武魂。
- 不允许两个完全相同的武魂实例。
- 不允许同一进化族谱中的两个初始武魂同时存在。
- 不允许用不同显示名称绕过重复检查。

武魂实体应增加：

```json
{
  "id": "clear_sky_hammer",
  "evolutionFamilyId": "hammer_clear_sky_family"
}
```

重复检测至少使用：

```text
definitionId
evolutionFamilyId
```

候选池耗尽时停止并报告，不允许无限重抽。

### 4. 路线互斥

核心路线需要互斥。

推荐字段：

```json
{
  "mutexGroups": ["major_faction_core"],
  "conflictPolicy": "block"
}
```

支持：

```text
block
replace
branch
```

默认使用 `block`。只有存在明确的转投、背叛、卧底剧情时才使用 `replace` 或 `branch`。

### 5. 15 岁特殊经历池

正式采用合并池：

```text
年龄 < 15：
只使用通用特殊经历池

年龄 >= 15：
通用特殊经历池 + 成年特殊经历池
```

对应旧表：

```text
年龄 < 15：Wheel 66
年龄 >= 15：Wheel 66 + Wheel 71
```

初始池倍率均为 `1`。合并后保留每个选项自己的权重。

### 6. 内容等级

所有适用的 wheel、item、flow、route、entity 支持：

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

过滤应在候选池建立时执行，不允许抽中后再作废。

### 7. 年度推进

年龄只由 `Game` 在年度会话开始前推进。

推荐顺序：

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

`WheelFlowEngine` 不允许直接增加或减少年龄。

---

## 三、战力系统定位

新增【战力系统】，但战力是从角色履历计算出的派生评分，不是可以被事件随意加减的普通 Player 属性。

禁止：

```json
{
  "effects": {
    "combatPower": 50
  }
}
```

推荐：

```js
const result = CombatPowerCalculator.calculate(player, rules);
```

返回：

```json
{
  "total": 2067,
  "breakdown": {
    "level": 760,
    "martialSoulQuality": 228,
    "martialSoulAvatar": 228,
    "soulRings": 262,
    "soulBones": 270,
    "domains": 152,
    "attributes": 167,
    "soulCore": 0
  },
  "rulesVersion": "combat-power/1.0"
}
```

Player 只保存等级、武魂、魂环、魂骨、领域、属性、神位、神器等真实状态。

---

## 四、等级战力

总等级范围：

```text
1 至 169
```

已给出的连续等级规则：

```text
1 至 10级：每级增加 1
11 至 20级：每级增加 2
21 至 30级：每级增加 3
之后每十级的单级增量继续增加 1
```

连续曲线公式：

```js
const decade = Math.floor((level - 1) / 10);
const remainder = level - decade * 10;
const continuousPower =
    5 * decade * (decade + 1) +
    remainder * (decade + 1);
```

该公式得到：

```text
10级 = 10
20级 = 30
30级 = 60
99级 = 540
100级 = 550
169级 = 1513
```

但项目负责人提供的剧情锚点是：

```text
99级 = 760
100级 = 1260
```

这说明等级战力还包含：

```text
境界突破奖励
特殊等级节点奖励
```

当前不要擅自修改连续等级公式来硬凑结果。

请将等级战力设计成：

```text
等级战力
= 连续等级成长战力
+ 境界突破奖励
+ 特殊等级节点奖励
```

先建立可配置表：

```json
{
  "maxLevel": 169,
  "continuousCurve": {
    "mode": "increment_by_decade"
  },
  "breakthroughBonuses": [],
  "specialLevelBonuses": [
    {
      "level": 100,
      "bonus": 490,
      "status": "provisional",
      "reason": "使100级从连续曲线和既有奖励跃升至1260"
    }
  ]
}
```

注意：

- 99级累计额外 `220` 点如何分配尚未最终确认。
- 不要隐藏常数。
- 配置验证器应检查 99级和100级锚点。
- 文档中明确把这部分标记为待平衡确认。

---

## 五、武魂品质战力与武魂真身

采用百分比，不采用固定点数。

### 武魂品质战力

```text
武魂品质战力
= round(等级战力 × 所有武魂品质系数之和)
```

当前案例锚点：

```text
顶级武魂品质系数 = 25%
极致武魂品质系数 = 30%
```

多武魂分别贡献品质系数，但需要配置总系数上限：

```json
{
  "martialSoulQualityStacking": {
    "mode": "sum",
    "coefficientCap": 1.0
  }
}
```

### 武魂真身

规则：

```text
70级以下：0
70级及以上：等级战力 × 当前激活武魂的真身系数
```

当前案例锚点：

```text
顶级武魂真身 = 25%
极致武魂真身 = 30%
```

多武魂角色只计算当前激活的一个武魂真身：

```json
{
  "martialSoulAvatar": {
    "mode": "active_only",
    "unlockLevel": 70
  }
}
```

武魂品质和武魂真身是两项独立战力，不得互相作为计算基数。

---

## 六、魂环年限基础战力

使用以下数据表：

```json
[
  { "minYears": 10, "maxYears": 99, "basePower": 1 },
  { "minYears": 100, "maxYears": 499, "basePower": 3 },
  { "minYears": 500, "maxYears": 999, "basePower": 5 },
  { "minYears": 1000, "maxYears": 4999, "basePower": 8 },
  { "minYears": 5000, "maxYears": 9999, "basePower": 11 },
  { "minYears": 10000, "maxYears": 49999, "basePower": 16 },
  { "minYears": 50000, "maxYears": 99999, "basePower": 21 },
  { "minYears": 100000, "maxYears": 199999, "basePower": 30 },
  { "minYears": 200000, "maxYears": 299999, "basePower": 40 },
  { "minYears": 300000, "maxYears": 399999, "basePower": 50 },
  { "minYears": 400000, "maxYears": 499999, "basePower": 60 },
  { "minYears": 500000, "maxYears": 599999, "basePower": 70 },
  { "minYears": 600000, "maxYears": 699999, "basePower": 80 },
  { "minYears": 700000, "maxYears": 799999, "basePower": 90 },
  { "minYears": 800000, "maxYears": 899999, "basePower": 100 },
  { "minYears": 900000, "maxYears": 999999, "basePower": 110 },
  {
    "minYears": 1000000,
    "maxYears": null,
    "basePower": 200,
    "ringType": "non_divine"
  }
]
```

神级金色魂环：

```json
{
  "ringType": "divine_gold",
  "fixedPower": 1000,
  "ignoreBloodlineMultiplier": true
}
```

1 至 9 年魂环的处理方式尚未决定。验证器先将其视为非法数据并报告。

---

## 七、魂兽血脉倍率

将原“魂环品质”正式命名为：

```text
soulBeastBloodlineGrade
```

倍率：

```json
{
  "low": 0.1,
  "ordinary": 1.0,
  "top": 2.0,
  "sub_dragon": 2.0,
  "earth_dragon": 2.0,
  "pure_dragon": 3.0
}
```

普通魂环战力：

```js
Math.max(1, Math.round(basePower * bloodlineMultiplier))
```

神级金色魂环固定为1000，不乘血脉倍率。

虽然顶级、亚龙种、地龙种当前都是200%，仍必须保留不同枚举，因为它们会影响：

- 剧情路线；
- NPC与宗门反应；
- 血脉进化；
- 魂技和魂环池；
- 神位路线。

神赐魂环没有天然魂兽血脉，使用独立字段：

```json
{
  "sourceType": "god_bestowed",
  "qualityMultiplier": 2
}
```

---

## 八、魂骨与神装

普通魂骨暂时沿用魂环年限基础战力和血脉倍率：

```text
魂骨战力
= 年限基础战力 × 血脉倍率
```

神装是魂骨的升级状态，使用替换关系，不重复计算普通魂骨：

```text
神装部件战力
= 原魂骨战力 × 神装倍率
```

当前案例使用：

```text
神装倍率 = 300%
```

推荐字段：

```json
{
  "equipmentState": "divine_armor",
  "divineMultiplier": 3,
  "replacesSoulBonePower": true
}
```

套装奖励独立计算。

外附魂骨或外附神装作为第七部位保存。

---

## 九、领域、属性与其他模块

领域：

```text
领域战力
= round(等级战力 × 所有领域系数之和)
```

属性：

```text
属性战力
= round(等级战力 × 所有属性系数之和)
```

所有百分比模块只以等级战力为基准，禁止链式复利。

后续预留但第一阶段不全部实现：

```text
魂核
神位
神器
魂兽年限修为
魂兽血脉等级
魂兽血脉融合
魂兽称号
人类称号
剧情人物阶段数据
```

---

## 十、人类和魂兽的基础战力来源

必须避免同时无条件计算“人类等级”和“魂兽修为年限”。

推荐：

```json
{
  "combatBase": {
    "mode": "level"
  }
}
```

合法模式：

```text
level
soul_beast_cultivation
hybrid
```

普通人类魂师使用 `level`。

未化形魂兽使用 `soul_beast_cultivation`。

化形魂兽和半人半魂兽必须使用明确的专用规则，不能默认把两套基础战力直接相加。

---

## 十一、总战力公式

第一版：

```text
总战力 =
等级战力
+ 武魂品质战力
+ 武魂真身战力
+ 魂环总战力
+ 魂骨或神装总战力
+ 领域战力
+ 属性战力
+ 魂核战力
+ 神位战力
+ 神器战力
+ 称号战力
+ 其他明确加成
```

舍入规则：

- 单个魂环、魂骨逐件四舍五入。
- 武魂品质、领域、属性先合并系数，再对小计四舍五入。
- 最终小计全部使用自然数。
- 普通魂环和魂骨单件最低战力为1。
- 总战力不得小于0。

---

## 十二、战斗判定原则

总战力不是必胜判定。

战斗采用：

```text
双方本场有效战力差距
→ 调整战斗结果转盘权重
→ 由转盘决定最终结果
```

静态总战力与本场有效战力分开：

```text
staticCombatPower
effectiveCombatPower
```

本场有效战力可以受以下因素影响：

```text
属性克制
领域压制
神器
伤势
地形
偷袭
NPC援助
剧情保护
特殊状态
```

第一阶段只设计接口和文档，不需要立刻实现完整战斗权重模型。

---

## 十三、案例验收锚点

### 99级常规极限斗罗

预期：

```json
{
  "total": 2067,
  "breakdown": {
    "level": 760,
    "martialSoulQuality": 228,
    "martialSoulAvatar": 228,
    "soulRings": 262,
    "soulBones": 270,
    "domains": 152,
    "attributes": 167,
    "soulCore": 0
  }
}
```

魂环小计：

```text
6 + 10 + 16 + 22 + 32 + 32 + 42 + 42 + 60 = 262
```

魂骨小计：

```text
42 + 42 + 42 + 42 + 60 + 42 = 270
```

### 100级海神唐三

预期总战力：

```text
14288
```

分解：

```json
{
  "level": 1260,
  "martialSoulQuality": 630,
  "martialSoulAvatar": 315,
  "soulRings": 3520,
  "divineArmor": 3200,
  "domains": 378,
  "attributes": 865,
  "soulCore": 0,
  "deity": 2520,
  "artifacts": 800,
  "other": 800
}
```

注意修正原文录入错误：

```text
40 × 200% = 80
```

不是 `-80`。

统一使用名称：

```text
昊天锤
```

---

## 十四、本轮具体工作任务

不要大规模改写现有代码。按以下顺序执行。

### 阶段 A：文档与协议

创建或更新：

```text
docs/DECISION_RECORD_V2.md
docs/COMBAT_POWER_SYSTEM.md
docs/EVENT_SCHEMA_V2_DRAFT.md
```

其中：

- `DECISION_RECORD_V2.md` 写入全部已确认负责人决策。
- `COMBAT_POWER_SYSTEM.md` 写入本任务书中的战力规则、锚点和待确认项。
- `EVENT_SCHEMA_V2_DRAFT.md` 定义 wheel、wheel item、flow、route、trigger、effects、advance、repeatWheel、dispatchWheel。

先不要删除或覆盖现有 `EVENT_SCHEMA.md`。

### 阶段 B：战力配置

新增数据驱动配置，例如：

```text
data/config/combat-power.json
```

至少包含：

```text
rulesVersion
level curve
breakthrough bonuses
martial soul quality coefficients
martial soul avatar coefficients
soul ring age brackets
bloodline multipliers
divine ring rule
soul bone rule
divine armor rule
rounding rule
```

对未确认数字使用：

```json
{
  "status": "provisional"
}
```

不要自行发明完整的1至169级突破奖励表。

### 阶段 C：纯函数计算器

新增独立模块，例如：

```text
js/combat-power.js
```

要求：

- 不操作 DOM。
- 不修改 Player。
- 输入 Player 状态和战力配置。
- 输出 total、breakdown、warnings、rulesVersion。
- 每个子模块使用独立函数。
- 对非法等级、非法魂环年限、未知血脉枚举、缺失实体发出明确错误或 warning。
- 不允许在函数内部硬编码剧情人物名字。

### 阶段 D：最小验证

为以下内容建立最小测试或开发期断言：

```text
10级 = 10
20级 = 30
30级 = 60
5000年普通血脉魂环 = 11
5000年低等血脉魂环 = 1
5000年顶级血脉魂环 = 22
5000年纯血龙种魂环 = 33
神级金色魂环 = 1000
99级案例魂环小计 = 262
99级案例魂骨小计 = 270
99级案例总和 = 2067
100级唐三案例总和 = 14288
```

如果99级和100级等级战力仍依赖未完成突破表，可在测试夹具中显式提供临时突破奖励，并标记为 provisional，不能偷偷写进通用公式。

### 阶段 E：最小 UI 接口

如果现有UI适合，仅增加一个不会破坏旧界面的战力展示接口。

推荐显示：

```text
总战力
等级
武魂品质
武魂真身
魂环
魂骨或神装
领域
属性
其他
```

如果会引发较大UI改动，本轮只提供 `CombatPowerCalculator` 和示例调用，不修改页面布局。

---

## 十五、禁止事项

本轮禁止：

- 批量重写510个旧转盘。
- 根据 WheelID 相邻关系自动建立正式剧情路线。
- 把“你选择”解释成玩家选项。
- 把战力保存成可被 effects 任意增减的永久数值。
- 在 Game、EventManager 或 UI 中硬编码魂环和武魂战力公式。
- 擅自补完全部神位、神器、称号战力。
- 擅自确定99级累计220点突破奖励的具体分配。
- 为了通过案例而写不可解释的隐藏常数。
- 删除现有兼容代码。

---

## 十六、完成后的报告格式

完成后请报告：

1. 修改和新增了哪些文件。
2. 每个文件承担什么职责。
3. 哪些规则已经可运行。
4. 哪些数字仍为 provisional。
5. 两个案例的实际计算结果。
6. 是否发现当前 Player 结构无法表达的字段。
7. 下一步最小任务建议。
8. 提供建议的 Git 提交命令和提交说明。

如果测试或验算未通过，请明确指出，不要伪造成功结果。
