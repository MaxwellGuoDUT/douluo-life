# 开发日志

项目：斗罗人生模拟器  
记录范围：2026-07-19 至 2026-07-25  
当前阶段：文字人生模拟 MVP，已具备玩家状态系统、事件、历史记录、数值效果、条件触发、武魂觉醒和学院入学事件链。

## 项目总览

《斗罗人生模拟器》从静态网页起步，逐步演进为一个由 `Game` 统一调度、`Player` 保存状态、`EventManager` 提供事件、`UI` 负责渲染的前端文字模拟游戏。

当前已经完成：

- 基础页面与 GitHub Pages 部署。
- 玩家数据模型 `Player`。
- Player State System v1.0，玩家拥有魂力、魂环、境界、身份、势力、金钱和声望等长期状态。
- 游戏管理器 `Game`。
- 事件系统 `EventManager`。
- 事件数据规范 `Event Schema v1.0`。
- 出生事件数据化。
- 玩家人生历史 `history`。
- Effects System v1.0，事件可以修改玩家数值。
- Trigger System v1.0，事件可以根据年龄、属性和历史动态触发。
- 武魂觉醒事件链，6 岁可根据属性和权重觉醒武魂。
- 学院入学事件链，觉醒后可根据武魂、标签和属性进入学院路线。
- UI 与游戏状态联动刷新。

当前主要架构：

```text
app.js
  -> Game
      -> Player
      -> EventManager
          -> Event Schema
          -> data/events/*.json
  -> UI
```

## Day 1 - 2026-07-19 - 项目初始化

版本：v0.0.1

### 目标

建立项目基础环境，并完成第一个可以访问和交互的网页版本。

### 完成内容

- 创建项目目录。
- 安装并配置 VS Code 与 Live Server。
- 建立 Git 仓库并上传 GitHub。
- 部署 GitHub Pages。
- 完成首页。
- 实现第一个按钮交互。

### 问题记录

GitHub Pages 因 `index.HTML` 文件名大小写导致 404。修正为 `index.html` 后恢复正常。

### 下一步

- 建立 `Player` 数据模型。
- 开始构建第一版可运行游戏流程。

## Day 2 - 2026-07-20 - MVP 与模块化

### 目标

完成游戏第一版基础架构：点击“开始新人/新人生”后创建玩家对象，让项目从静态网页进入可运行的游戏状态。

### 完成内容

- 新增 `js/player.js`，创建 `Player` 类。
- 新增 `js/game.js`，创建 `Game` 管理器。
- 新增 `js/app.js`，连接页面按钮与游戏逻辑。
- 引入 ES Module，使用 `import` / `export` 组织代码。
- 完成第一版 MVP：打开网页、点击按钮、创建 `Game`、创建 `Player`，并在 Console 输出玩家对象。

### 架构收获

明确了第一条核心职责边界：

- `Game` 管理游戏流程。
- `Player` 保存玩家数据。
- `app.js` 负责连接页面交互与游戏逻辑。

这为后续事件、年龄、战斗、存档等系统预留了清晰入口。

### 调试记录

主要问题是点击按钮没有反应。排查过程包括：

- 检查 HTML 按钮 id。
- 确认脚本需要 `type="module"` 才能使用 ES Module。
- 检查 `app.js -> game.js -> player.js` 的引用路径。
- 使用 `console.log` 分段确认模块加载、按钮绑定、点击触发和玩家创建。

### 学习重点

- JavaScript Class 与 `constructor()`。
- `new` 创建对象。
- ES Module。
- `addEventListener()`。
- 浏览器 Console 调试。
- GitHub Pages 部署流程。

## Day 3 - 2026-07-21 - 人生推进与事件系统

### 目标

实现第一版人生推进系统，让玩家从“被创建的数据对象”进入真正的年龄成长与事件触发流程。

### 完成内容

- 新增 `js/event.js`，创建 `EventManager`。
- 支持按年龄获取事件。
- 增加默认事件兜底。
- 在 `Game` 中接入事件系统。
- 新增 `nextYear()`，实现年龄推进。
- 新增 `js/ui.js`，拆分页面渲染逻辑。
- 完成人生循环：创建玩家、获取事件、显示状态、继续成长、年龄 +1、进入下一事件。

### 架构变化

Day 3 之后，项目从单纯创建玩家，升级为可推进的文字模拟流程：

```text
Game
  -> Player
  -> EventManager
UI
  -> renderPlayer()
  -> renderEvent()
```

`Game` 负责状态和流程，`UI` 负责显示，`app.js` 只负责用户交互入口。

### 调试记录

主要围绕 DOM 与模块连接：

- 页面按钮与 JavaScript 模块的绑定。
- DOM 元素 id 与 UI 渲染函数对应。
- 游戏逻辑与页面显示分离后的调用顺序。

### 下一步

将事件数据从代码中拆出，建立 `events.json` / 事件数据文件，并为随机事件、分支事件和大规模事件库做准备。

## Day 4 - 2026-07-22 - 事件数据化与历史记录

### 目标

把事件系统从“代码里写死的事件”升级为“数据驱动的事件结构”，并建立玩家人生历史记录，为长期模拟打基础。

### 完成内容

- 新增 `docs/EVENT_SCHEMA.md`。
- 建立 `Event Schema v1.0`，统一事件字段。
- 新增 `data/events/birth.json`。
- 将出生事件迁移为数据文件。
- 调整事件触发结构，从 `event.age` 改为 `event.trigger.age`。
- 在 `Player` 中新增 `history = []`。
- 在 `Game` 中新增事件记录逻辑。
- 在 `UI` 中新增 `renderHistory(history)`。

### Event Schema v1.0

事件标准结构：

```json
{
  "id": "birth_001",
  "title": "出生",
  "text": "你降临到了斗罗大陆。",
  "trigger": {
    "age": 0
  },
  "tags": ["birth", "milestone"],
  "effects": {},
  "weight": 100,
  "next": []
}
```

字段职责：

- `id`：事件唯一编号。
- `title`：事件标题。
- `text`：事件正文。
- `trigger`：触发条件。
- `tags`：事件分类标签。
- `effects`：事件效果。
- `weight`：随机权重。
- `next`：后续事件。

### 架构变化

Day 4 的关键变化是把事件从逻辑层抽离出来：

```text
Day 3:
EventManager
  -> 写死事件数据

Day 4:
EventManager
  -> Event Schema
  -> data/events/birth.json
```

同时玩家开始拥有可追踪的人生轨迹：

```text
Player
  -> history
      -> { age, event }
```

### 复盘

这一天原日志内容较多，核心其实可以归纳为两件事：

1. 事件开始标准化、数据化。
2. 玩家经历开始可记录、可展示。

这两个变化把项目从“事件触发器”推进到了“人生模拟系统”的雏形。后续无论增加武魂觉醒、学院、战斗、NPC 还是结局，都可以沿着同一套事件结构扩展。

### 下一步

实现 Effects System，让事件不只显示文字，还能修改玩家状态。

## Day 5 - 2026-07-23 - Effects System v1.0

### 目标

让事件真正影响玩家属性，并在 UI 上实时反馈变化。

### 完成内容

- 在 `Game` 中新增统一的 `applyEffects(event)`。
- 事件通过 `effects` 自动修改 `Player` 数值属性。
- 支持一个事件同时修改多个数值。
- 支持正数增加、负数减少、0 值保留。
- 增加 Effects 数据校验。
- 更新 `EVENT_SCHEMA.md`，补充 Effects v1.0 规范。
- 完成事件执行后的 UI 自动刷新。

### Effects v1.0 规则

- 每个事件必须包含 `effects`。
- 没有效果时使用 `"effects": {}`。
- `effects` 必须是对象。
- key 必须对应 `Player` 已有属性。
- v1.0 只支持数值型属性。
- value 必须是 number。

示例：

```json
{
  "effects": {
    "luck": 5,
    "power": 2,
    "hp": -10
  }
}
```

执行后等价于：

```js
player.luck += 5;
player.power += 2;
player.hp -= 10;
```

### 架构变化

事件执行链路变为：

```text
事件触发
  -> applyEffects()
  -> Player 状态变化
  -> history 记录事件
  -> UI 重新渲染
```

这意味着事件已经不只是叙事文本，而是可以驱动玩家成长的系统数据。

### 当前状态

项目已经具备 RPG 与人生模拟的基础机制：

- 玩家状态。
- 年龄推进。
- 事件触发。
- 事件数据规范。
- 事件效果执行。
- 历史轨迹展示。
- UI 自动反馈。

### 下一步

实现 Trigger System，让事件不只根据年龄触发，还能根据玩家属性、已发生事件、标签、阶段等条件动态决定是否发生。

## Day 6 - 2026-07-25 - Trigger System v1.0

### 目标

让事件不再只依赖固定年龄触发，而是可以根据玩家当前状态和人生历史动态决定是否发生。

### 完成内容

- 在 `EVENT_SCHEMA.md` 中新增 Trigger v1.0 规范。
- 将 `EventManager.getEventByAge(age)` 重构为 `getEvent(player)`。
- 新增 `getAvailableEvents(player)`，统一筛选当前可触发事件。
- 新增 `matchTrigger(event, player)`，集中判断事件触发条件。
- 支持固定年龄 `age`。
- 支持年龄范围 `minAge` / `maxAge`。
- 支持数值属性条件 `attributes`。
- 支持历史事件条件 `hasEvent`。
- 支持历史标签条件 `hasTag`。
- 新增按 `weight` 权重随机选择事件。
- 增加 Trigger、tags、weight 等基础数据校验。
- 补充少量成长测试事件，用于验证属性与历史条件。

### Trigger v1.0 规则

当前事件触发链路变为：

```text
玩家推进年龄
  -> EventManager.getAvailableEvents(player)
  -> matchTrigger(event, player)
  -> pickWeightedEvent(events)
  -> Game.applyEffects(event)
  -> history 记录事件
  -> UI 重新渲染
```

Trigger v1.0 支持的条件：

- `age`：固定年龄触发。
- `minAge` / `maxAge`：年龄区间触发。
- `attributes`：根据玩家数值属性触发。
- `hasEvent`：根据已经发生过的事件 id 触发。
- `hasTag`：根据已经发生过的事件标签触发。

### 架构变化

Day 6 的核心变化是把“事件是否发生”的判断权从年龄匹配升级为完整条件匹配：

```text
Day 5:
EventManager
  -> getEventByAge(age)

Day 6:
EventManager
  -> getAvailableEvents(player)
  -> matchTrigger(event, player)
  -> pickWeightedEvent(events)
```

这为后续武魂觉醒、学院入学、战斗遭遇、宗门邀请和结局判断预留了统一入口。

### 下一步

优先开始扩展事件库，让空的 `academy.json`、`battle.json`、`ending.json` 逐步接入真实事件数据。建议 Day 7 先实现武魂觉醒事件与基础武魂数据。

## Day 7 - 2026-07-25 - 武魂觉醒事件链

### 目标

利用 Trigger、Effects 和 History 系统完成第一个正式玩法阶段：6 岁武魂觉醒。

### 完成内容

- 新增 `data/events/growth.json`，将成长测试事件从 JS 迁移到数据文件。
- 新增 `data/events/default.json`，将默认兜底事件迁移到数据文件。
- 新增 `data/events/spirit.json`，建立 6 岁武魂觉醒事件链。
- 新增 `data/entities/martial_souls.json`，记录基础武魂数据。
- `EventManager` 改为统一加载出生、成长、武魂事件数据。
- 保留事件文件兼容性：单个事件对象和事件数组都可以加载。
- Trigger 新增 `state` 条件，用于判断 `spirit: null` 等非数值状态。
- Effects 扩展支持 `{ "set": value }` 操作，用于设置 `spirit`。
- UI 新增武魂显示，未觉醒时显示“未觉醒”。
- 更新 `EVENT_SCHEMA.md`，补充 set 操作规范。

### 当前武魂事件

- `spirit_awaken_blue_silver_grass`：蓝银草。
- `spirit_awaken_soft_bone_rabbit`：柔骨兔。
- `spirit_awaken_clear_sky_hammer`：昊天锤。

这些事件都由数据驱动，通过 `age: 6`、`spirit: null`、历史标签、属性条件和 `weight` 共同决定是否进入候选池以及最终触发结果。

### 架构变化

事件数据来源从代码内置进一步迁移到数据文件：

```text
EventManager
  -> data/events/birth.json
  -> data/events/default.json
  -> data/events/growth.json
  -> data/events/spirit.json
```

武魂觉醒执行链路：

```text
玩家 6 岁
  -> Trigger 筛选可觉醒事件
  -> weight 随机选择武魂
  -> Effects set player.spirit
  -> History 记录觉醒事件
  -> UI 显示武魂
```

### 下一步

Day 8 建议进入学院阶段：根据是否已经觉醒武魂、武魂类型和玩家属性，触发初级魂师学院入学或普通成长路线。

## Day 8 - 2026-07-25 - 学院入学事件链

### 目标

在武魂觉醒之后，建立第一个后续成长阶段：学院入学。

### 完成内容

- 在 `Player` 中新增 `academy` 状态，默认值为 `null`。
- UI 新增学院显示，未入学时显示“未入学”。
- 填充 `data/events/academy.json`，新增学院入学事件链。
- `EventManager` 接入 academy 事件数据文件。
- 学院事件通过 Trigger 判断是否已觉醒武魂、是否已入学、武魂类型、历史标签和属性条件。
- Effects 继续使用 `{ "set": value }` 设置 `player.academy`。
- 更新 `EVENT_SCHEMA.md`，将 `academy` 加入可 set 的 Player 属性。

### 当前学院事件

- `academy_enter_nuoding`：普通进入诺丁初级魂师学院。
- `academy_work_study_student`：蓝银草路线的工读生名额。
- `academy_elite_recommendation`：稀有武魂与较高等级触发的特别推荐。

这些事件都由 `age: 7`、`academy: null`、武魂状态、历史标签和属性条件共同决定是否进入候选池，并通过 `weight` 决定最终触发结果。

### 架构变化

事件数据来源继续扩展：

```text
EventManager
  -> data/events/birth.json
  -> data/events/default.json
  -> data/events/growth.json
  -> data/events/spirit.json
  -> data/events/academy.json
```

学院入学执行链路：

```text
玩家 7 岁
  -> 已发生 awakening 标签事件
  -> academy 仍为 null
  -> Trigger 筛选学院候选事件
  -> weight 随机选择入学路线
  -> Effects set player.academy
  -> History 记录入学事件
  -> UI 显示学院
```

### 下一步

Day 9 建议开始学院学习阶段：加入 8-12 岁的课程、修炼、同学互动和基础战斗事件，为后续战斗系统做铺垫。

## Day 9 - 2026-07-25 - Player State System v1.0

### 目标

暂停继续堆事件，先完善玩家状态容器，让后续事件只需要通过 Trigger 读取状态、通过 Effects 修改状态。同时根据转盘游戏定位，移除传统 RPG 四维属性，把复杂度放回斗罗体系本身。

### 完成内容

- 移除 `hp`、`power`、`agility`、`intelligence`、`luck` 等传统 RPG 属性。
- 移除 `soulPower` 经验进度，避免每年转盘节奏被经验条拖慢。
- 移除独立的 `soulRingCount`，改为由 `soulRings.length` 自然得出。
- 新增 `soulRings` 数组，用于记录每个魂环的具体年限和大等阶。
- 新增 `soulBones` 七部位对象：头部、躯干、四肢、外附魂骨。
- 保留 `level`、`rank`、`spirit`、`academy`、`faction`、`title`、`money`、`reputation` 作为转盘叙事状态。
- Effects 新增 `add` 操作，用于向 `soulRings` 追加魂环。
- Effects 新增 `setKey` 操作，用于设置 `soulBones` 的具体部位。
- Trigger 新增 `nestedState`，用于判断魂骨部位等一层嵌套状态。
- Trigger `attributes` 新增 `gt` / `gte` / `lt` / `lte` / `eq` 比较语法。
- 保留旧的 `min` / `max` / `equals` 写法，避免破坏已有事件。
- 将现有事件中的旧属性依赖改为等级、声望、金钱、身份等履历状态。
- 新增 `data/events/cultivation.json`，放入第一魂环与外附魂骨示例事件。
- 更新 UI，显示魂环列表和魂骨概况。
- 重写 `EVENT_SCHEMA.md`，补充斗罗履历状态、魂环、魂骨、Effects 操作和 Trigger 规则。
- 更新 `AI_CONTEXT.md`，明确项目不做传统 RPG 四维属性。

### Player State v1.0

当前 Player 状态扩展为：

```text
age
level
rank
spirit
soulRings
soulBones
academy
faction
money
reputation
title
```

这些字段让事件可以自然表达后续玩法：

```json
{
  "effects": {
    "money": 50,
    "reputation": 10,
    "faction": {
      "set": "武魂殿"
    }
  }
}
```

也可以自然表达触发条件：

```json
{
  "trigger": {
    "attributes": {
      "money": {
        "gte": 100
      }
    }
  }
}
```

### 架构变化

Day 9 的重点是让系统从“事件推动流程”继续升级为“状态驱动模拟”：

```text
Player State
  -> Trigger 读取状态
  -> Event 发生
  -> Effects 修改状态
  -> UI 展示状态
  -> History 记录经历
```

### 下一步

Day 10 建议开始转盘事件池阶段：加入 8-12 岁学院生活、10 岁第一魂环、同学互动、金钱和声望事件，让新的履历状态真正参与每年一次的转盘循环。

## 阶段总结

前 9 天的开发可以概括为七次升级：

1. 从静态页面到可运行 MVP。
2. 从玩家对象到人生推进流程。
3. 从写死事件到数据驱动事件系统。
4. 从固定年龄触发到条件驱动触发系统。
5. 从基础人生事件到第一个正式玩法阶段：武魂觉醒。
6. 从武魂觉醒进入学院入学路线。
7. 从少量状态字段升级为完整 Player State 容器。

当前项目最重要的设计方向已经明确：用统一的数据规范描述事件，用 `Game` 执行规则，用 `Player` 保存状态，用 `UI` 展示结果。接下来应优先完善触发条件、事件库、存档和更丰富的玩家属性系统。

## Day 10 - 2026-07-31 - Event Schema v2 与战力基础设施

### 目标

暂停批量扩写旧剧情，先建立 v2 阶段需要的设计边界和战力计算基础设施。重点是让路线、事件和战力系统有清晰的规则入口，而不是把公式或跳转逻辑写死进旧运行时。

### 完成内容

- 新增 `docs/DECISION_RECORD_V2.md`，记录 Event Schema v2、路线系统和战力系统的阶段性决策。
- 新增 `docs/EVENT_SCHEMA_V2_DRAFT.md`，整理 Event Schema v2 草案和兼容边界。
- 新增 `docs/COMBAT_POWER_SYSTEM.md`，说明战力是派生值，不是 Player 上可被 effects 永久加减的属性。
- 新增 `data/config/combat-power.json`，将等级、魂环、血脉倍率等战力参数放入数据配置。
- 新增 `js/combat-power.js`，提供纯函数战力计算模块。
- 为等级、魂环、血脉倍率、99 级极限斗罗和 100 级海神唐三样例建立开发期验证。
- 对未确认数值保留 `provisional` 标记，没有把 99 级累计额外 220 点拆分写成隐藏常数。

### 设计边界

- 不批量改写 510 个旧转盘。
- 不根据 WheelID 顺序自动生成正式剧情跳转。
- 不把叙事里的“你选择”“你决定”解释成玩家主动选择。
- 不让 effects 直接修改派生战力。
- 不在 `Game`、`EventManager` 或 UI 中硬编码战力公式。
- 不擅自补完整套神位、神器、称号战力。

### 下一步

Day 11 进入 Player State v2 和流程基础设施：先做 v1 到 v2 的纯迁移适配器和兼容选择器，再继续建立 Event Schema v2 验证器、路线状态、AnnualSession 和 WheelFlowEngine 最小骨架。

## Day 11 - 2026-07-31 - Player v2 与 Wheel Flow Foundation

### 目标

在不切换现有 `Game.newGame()` 和 Player v1 运行路径的前提下，建立 Player State v2、迁移适配器、兼容选择器、事件验证器和最小流程引擎，为后续路线系统和年度转盘流程做基础设施准备。

### 完成内容

- 新增 Player State v2 基础结构。
- 新增 Player v1 到 v2 的纯迁移适配器。
- 新增兼容选择器，让新系统可以只读访问 v2 结构，同时不破坏 v1 当前运行。
- 新增 Event Schema v2 静态验证器和示例覆盖。
- 新增路线状态系统与 AnnualSession 模型。
- 新增 WheelFlowEngine 最小骨架，当前覆盖 `roll`、`same_year`、`end` 等基础流程操作。
- 增加战力兼容和只读展示入口，继续保持战力为派生值。
- 追加修复以保护 v2 状态不变量。

### 本地提交

- `9b69616 feat: add player state v2 and migration adapter`
- `4fc850a feat: add event schema v2 validator`
- `ba1f82b feat: add route state and annual session models`
- `8f50950 feat: add minimal wheel flow engine`
- `9e76d35 fix: preserve v2 state invariants`

### 验证结果

- `node --test` 通过。
- 共 66 项测试通过。
- 语法检查通过。
- JSON / 文档块检查通过。
- EventManager 加载检查通过。
- Player v1 new-game smoke test 通过。

### 当前边界

- Player v1 仍是现有运行路径，尚未切换到 Player v2。
- WheelFlowEngine 仍是最小骨架，`next_year`、`repeat`、`dispatch`、`terminal` 等复杂流程能力留待后续阶段。
- 路线状态和 AnnualSession 已建立基础模型，但尚未大规模接入旧转盘数据。
- 负责人输入材料仍保持未暂存状态，不混入功能提交。

### 收尾状态

Day 11 本地阶段可以告一段落。下一步是将当前分支 `codex/day10-v2-combat-foundation` 推送到远端并创建 Draft PR，交给网页端 review Player v2、Event Schema v2 validator、RouteState、AnnualSession、WheelFlowEngine 的边界与命名。
