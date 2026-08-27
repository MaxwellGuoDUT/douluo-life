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

## Day 12 - 2026-08-02 - V2 年度流程端到端垂直切片

### 目标

在不改变 V1 主入口的前提下，把 Player v2、AnnualSession 和 WheelFlowEngine 串成一条可连续执行的 V2 年度流程，并提供独立浏览器 demo。

### 完成内容

- 新增 `V2SessionRunner`，统一编排 Player v2、年度会话、wheel、flow、effects、spin 和年度记录提交。
- 为 `WheelFlowEngine` 增加最小 `next_year` 运行时语义。
- 明确 `same_year`、`end` 和 `next_year` 的年度边界；`next_year` 只推进年龄一次，不自动执行下一年度 flow。
- 新增通过 Event Schema v2 校验的最小垂直切片数据。
- 新增独立 `v2-demo.html`、V2 app/UI 入口，支持连续推进多个年度。
- 增加失败原子性、重复提交保护、确定性 RNG、派生战力只读和连续三年度集成测试。
- 新增 [Day12 独立工作日志](CODEX_DAY12_V2_VERTICAL_SLICE_LOG.md)。

### 验证结果

- bundled Node.js v24.14.0 执行 `node --test`：71 tests，71 pass，0 fail，0 skipped。
- 全部 `js/*.js` 通过语法检查。
- `git diff --check` 通过。
- 自动化测试覆盖连续三个年度、年龄推进、spin/history 累积和确定性 RNG。
- V1 主入口和 V1 运行路径未修改。

### 浏览器验证状态

V2 demo 的实时浏览器点击、DOM 状态读取和控制台检查尚未完成。当前 Codex 会话缺少专用 Node REPL 控制端点，暂时无法执行以下手工验收：连续推进三年，以及检查年龄、spin、history、战力和控制台错误。因此本阶段只能确认代码与自动化测试完成，不能将浏览器手工验证记为通过。

### 当前边界

- Player v2 不持久化派生战力，战力仍由计算器实时派生。
- `inferred` 和 `provisional` 内容未自动升级为 `confirmed`。
- `gate`、完整路线接入、save/load、battle、terminal、旧数据正式迁移和完整 UI 重写仍未实现。
- 负责人未提交材料保持未暂存，不混入 Day12 功能提交。

### 收尾状态

Day 12 的代码实现和自动化验收已完成；浏览器手工验收待具备 Node REPL 的会话补做。提交前应继续保持 V1 可运行，并只提交 Day12 实际文件与本日志。

## Day 13 - 2026-08-07 - 第一条正式 V2 内容：6 岁武魂觉醒

### 目标

停止横向扩建 V2 基础设施，用现有年度运行时承载第一条 production 游戏内容，并保持 V1 独立可运行。

### 完成内容

- 新增 `data/v2/content/age-6-awakening.json`，与 examples 和 legacy reference 明确分离。
- 只使用 V1 已确认的三种觉醒结果、文本和权重：蓝银草 60、柔骨兔 30、昊天锤 10。
- 保留 V1 已确认的等级结果：蓝银草与柔骨兔保持初始 1 级，昊天锤增加 2 级后为 3 级；未采用 legacy reference 中未确认的独立先天魂力轮盘。
- 新增最小 annual flow registry/resolver，只负责将 6 岁映射到 confirmed 觉醒 flow。
- 为正式觉醒内容开放 `martialSouls` 根集合 `add` 和 `activeMartialSoulInstanceId` `set`；动态嵌套路径仍然禁止。
- 使用现有单个 `roll` 与 `next_year` 完成年度流程，没有新增 WheelFlowEngine op。
- 更新 DR-007，正式采用年度成功后由 V2SessionRunner 原子推进年龄的语义。
- 更新 README、AI_CONTEXT、Event Schema v2 effects 说明，并标记旧状态/设计文档为 historical input。

### 验证结果

- bundled Node.js 执行 `node --test`：77 tests，77 pass，0 fail，0 skipped。
- 覆盖 production schema、年龄 registry、确定性 RNG、具体武魂与等级 effects、spin、history、6 → 7 岁、无候选和中途失败回滚。
- 修改及新增 JavaScript 通过 `node --check`。
- production JSON 解析、`git diff --check` 和新文件空白检查通过。
- V1 new-game smoke test 继续通过。

### 浏览器验证状态

当前任务未取得应用内浏览器控制接口，无法执行真实点击、DOM 和 console 验收。浏览器 smoke 保持待补，未使用 HTTP 访问结果代替。

### 当前边界

- V2 仍未切换为主入口。
- 本轮没有实现 gate、dispatchWheel、repeatWheel、terminal、完整 RouteState runtime、save/load、battle 或 ending。
- legacy reference 仍保持 reference 身份，inferred/provisional 没有升级为 confirmed。

## Day 13 / Day 13.5 - 2026-08-08 - Production 里程碑与仓库收口

### Day 13

- V2 正式进入 production 内容承载阶段，新增第一条 production 内容“6 岁武魂觉醒”。
- 新增最小 annual flow resolver，使用现有 `roll + next_year` 完成 6 → 7 岁年度闭环；没有新增 `gate`、`dispatchWheel`、`repeatWheel`、`setRoute`、`terminal` 等 WheelFlowEngine op。
- confirmed 内容只采用现有 V1 已确认的武魂数据；legacy 独立先天魂力轮盘未达到 confirmed，因此没有进入 production。
- 正式武魂 effects 增加 `martialSouls` 根集合 `add` 和 `activeMartialSoulInstanceId` `set`。
- 年龄语义正式确定为：基于当前 age 创建年度 session；年度全部成功后由 `V2SessionRunner` 原子提交；`next_year` 成功后 age + 1；失败不推进年龄，也不留下 effects、history 或 spin 半提交状态。
- production data 与 examples、legacy reference 保持分离。
- 最终测试为 77 tests，77 pass，0 fail，0 skipped。

相关提交：

- `8fb6dcbba1ec4d749f59099a260abc3a056d64d6 docs: align v2 age semantics and project context`
- `a2dc7e04eeb1e65f80ca77ec6ea0d5ccc7e388d5 feat: add production age-6 awakening flow`

### Day 13.5

- 完成 Repository Housekeeping，将此前 untracked 的负责人任务书、历史状态资料、legacy wheel reference 和转换工具正式纳入 Git。
- 明确维持 `reference ≠ production`、`inferred ≠ confirmed`，没有修改 Day 13 production 代码。
- legacy 数据检查确认 2753 条原始记录、510 个 normalized wheels、20 条 inferred routes、6 条 inferred flows，conversion report validation 全部通过。
- 转换工具 Python 语法检查通过。
- 再次运行完整测试，结果仍为 77 tests，77 pass，0 fail，0 skipped；收口后 working tree clean。

相关提交：

- `a9ffbc46267e609a0e51a22fd19e520af5ab2306 docs: preserve v2 planning and historical project records`
- `92ac5a2f7cb6ee49d3b9c85b575e05750adf69a1 chore: add legacy wheel reference data and conversion tooling`

### 今日结束时项目状态

- V1 仍保持独立可运行。
- V2 已从技术样机正式进入 production 内容阶段，当前第一条 production V2 内容为“6 岁武魂觉醒”。
- 当前稳定测试基线为 77/77。
- 真实浏览器点击验收尚未完成。
- 尚未开始 Day 14，下一阶段方向尚未正式执行。

## Day 14 - 2026-08-08 - V2 Production Playtest 与年度编排收口

### 目标

把现有独立 V2 技术 demo 升级为当前唯一 production 内容“6 岁武魂觉醒”的真实页面入口，并在 7 岁没有 confirmed annual flow 时诚实停在内容边界。

### 完成内容

- 新增 DOM 无关的薄编排层 `V2ProductionPlaytest`，显式创建 6 岁 Player，不伪造 0～5 岁 history 或 spinHistory。
- 页面和编排层在每次年度执行前按当前 Player.age 调用 Annual Flow Resolver，不再通过 `dataset.flows[0]` 固定 flow。
- 编排层拒绝 examples、非 production、unconfirmed 和非 canon 年度内容，并继续使用 `allowedCanonLevels: ["canon"]`。
- 使用现有 V2SessionRunner 完成 6 → 7 岁 effects、spin、history 和年龄的原子提交；失败时 playtest state 保持不变。
- 只有成功完成 6 岁年度且 Player 已到 7 岁时，才将 `NO_ANNUAL_FLOW_FOR_AGE` 映射为 `CONTENT_BOUNDARY_REACHED`；其他 resolver errors 保持真实错误。
- V2 页面现在加载 `data/v2/content/age-6-awakening.json`，不再把 examples vertical slice 作为运行数据。
- 页面明确标注 production playtest、6 岁场景起点和“不包含 0～5 岁履历”，并展示真实 itemId、叙事文本、武魂、等级/境界、spin/history、年度记录、派生战力、warnings、errors 和 7 岁内容边界。
- 到达内容边界后按钮保持禁用，不创建 7 岁 AnnualSession，不增加第二条 spin/history，也不消费额外的内容 RNG。

### 自动化与静态验证

- Day 14 定向测试：15 tests，15 pass，0 fail，0 cancelled，0 skipped。
- 完整 bundled Node.js 测试：92 tests，92 pass，0 fail，0 cancelled，0 skipped。
- V1 `existing new-game smoke continues to create Player v1` 独立执行：1 test，1 pass。
- 新增或修改的三个 JavaScript 文件全部通过 `node --check`。
- `git diff --check` 通过。
- app 源码中没有 `data/v2/examples` 或 `dataset.flows[0]` 运行时引用。
- Player 仍不持久化 `combatPower`、`staticCombatPower` 或 `effectiveCombatPower`。

### 浏览器验收状态

- 本地 HTTP 服务能够返回 V2 页面、app、production JSON 和 V1 页面，均为 HTTP 200；该结果只作为静态服务层检查。
- 当前 Codex 任务没有挂载可控制应用内浏览器的端点，因此 Codex 没有把 HTTP 结果冒充为自动点击或 DOM 验收。
- 2026-08-08，负责人在真实页面完成手工验收：V2 初始 6 岁状态、单次觉醒点击、7 岁 DOM 结果、itemId 与叙事文本、spin/history、content boundary、按钮禁用、Network 加载 production 且不加载 examples、console 无异常、刷新重置，以及 V1 开始人生和推进回归。
- 负责人报告以上手工浏览器验收项目全部通过；该结论明确记录为负责人手工验收，不表述为 Codex 自动浏览器控制结果。

### 当前边界

- V1 仍是默认入口，未修改 `index.html`、`js/app.js` 或 `js/game.js`。
- 没有修改 Player v2 schema、Event Schema validator、Annual Flow Resolver、V2SessionRunner 或 WheelFlowEngine。
- 没有新增 engine op、学院、0～5 岁、第一魂环、save/load、battle、ending 或通用内容发现基础设施。
- production、examples 和 legacy reference 继续分离；没有自动升级 inferred/provisional。
- 刷新页面后回到 6 岁 playtest 起点是当前明确设计边界，不代表存档恢复。
- Day 14 实现仅按明确文件列表 staging，并创建提交 `220ada5647714e72cf5f6c081f4ecef4a5dffe91`；Day 14 任务书继续作为 untracked 负责人输入材料保留。

### 发布收尾（2026-08-09）

- V2 基础工作通过 [PR #1](https://github.com/MaxwellGuoDUT/douluo-life/pull/1) 使用 merge commit 合并到 `main`，merge commit 为 `4d564d89ae4147db3ff30a335cdfa00c24ff74a2`。
- Day 14 production playtest 通过 [PR #2](https://github.com/MaxwellGuoDUT/douluo-life/pull/2) 使用 merge commit 合并到 `main`，merge commit 为 `3c031a3ad4cd52efc4afd16d081fa1e70284f6d9`。
- PR #2 合并时仍只包含 Day 14 提交 `220ada5647714e72cf5f6c081f4ecef4a5dffe91` 和约定的 8 个文件；Day 14 任务书未进入提交或 PR。
- `main` 已包含 Day 14 的实现、自动化验证记录和负责人手工浏览器验收记录；两个开发分支均按负责人要求保留。
- 本次发布收尾仅修订 `docs/DEVLOG.md`，不修改功能、测试、架构或 production 数据边界。

## Day 15 - 2026-08-10 - V2 Production 完整武魂觉醒链

### 基线与审定输入

- 开始分支为 `codex/day14-release-closeout`，HEAD 为 `dee56b1b356dd4d31fca2bc585ca05bda470f05c`；本任务没有创建或切换分支。
- 开始时重新运行完整自动化测试，真实基线为 92 tests、92 pass、0 fail。
- 原审定工作簿保持只读，SHA-256 为 `78BDC7F2FFEFD3529B690265490855EC641F8AF7F841EF1D057034D4EE4426FA`。
- 原 271 项主模式目录中存在六个不足 4 项的形态品质格；严格无放回下计算到约 0.193090% 的正常耗尽风险。
- 负责人通过独立增量工作簿重新审定并明确接受全部 14 项建议。生成器以版本化决定文件逐条验证原形态和原品质后再应用，不修改或重新保存原工作簿。

### 正式目录与概率

- 新增确定性只读生成器和 `martial-souls/1.1` production JSON，共 271 项：233 `canon`、38 `expanded`、0 `crossover`、0 `parody`。
- 五种形态总数：器 84、兽 119、植物 32、本体 20、食物 16。
- 四种品质总数：低等 44、普通 82、顶级 91、极致 54。
- 20 格容量：器 19/26/29/10；兽 4/44/46/25；植物 13/4/6/9；本体 4/4/6/6；食物 4/4/4/4（均按低等/普通/顶级/极致顺序）。
- 所有格至少 4 项，因此 1～4 槽严格无放回下正常耗尽概率为精确 0；人工构造的三候选格仍会抛出 `NO_ELIGIBLE_MARTIAL_SOUL_DEFINITION` 并回滚。
- 新增独立整数权重概率配置；负责人随机验收发现逐槽独立品质抽取会生成混合品质，随后明确纠正为 `awakening-probabilities/1.1`：按先天魂力只抽取一次品质，全部槽位共享结果，不使用隐藏衰减或重抽。先天魂力仍不影响固定形态权重。
- 负责人进一步选择按世界观稀有度调整基础形态，形成 `awakening-probabilities/1.2`：器 34%、兽 36%、植物 20%、食物 6%、本体 4%；内容依赖同步提升至 `age-6-awakening/2.2`。形态仍按槽位独立抽取，且不受先天魂力或共享品质影响。

### Production 运行链

- 6 岁 flow 现在依次执行：先天魂力 → 1～4 武魂数量 → gate → 一次共享品质 → 每槽独立形态 → 匹配目录内等权无放回定义 → 内容驱动实例化 → 年度原子提交 → 7 岁边界。
- 每个实际随机步骤都记录 spin；一武魂为 5 spin，四武魂为 11 spin。共享品质 spin 明确记录适用槽位，年度 history 保存先天魂力、天赋、数量、共享品质、定义 ID、名称和三个版本号。
- AnnualSession 新增隔离的 `sessionContext`；WheelFlowEngine 只实现本链所需的 `saveAs`、`gate`、`dispatchWheel` 和 `repeatWheel` 窄语义。
- Player v2 合法支持先天 0 级：`level = 0`、仍觉醒武魂、`soulPowerGrowthLocked = true`，不夹成 1 级。
- 品质战力系数明确为低等 0%、普通 10%、顶级 25%、极致 30%，多武魂系数累加上限 100%；派生战力仍不持久化到 Player。
- V2 页面加载正式目录、概率、年度 flow 和战力配置，展示 1～4 个完整武魂结果及 definitionId、形态、品质、属性和品质战力系数。

### 自动化与静态验证

- 完整 bundled Node.js 测试：120 tests、120 pass、0 fail、0 cancelled、0 skipped。
- 覆盖目录统计和边界、生成器确定性、概率行与精确边界、1～4 武魂、去重、等权、目录耗尽、0 级、四档战力、七个失败注入点、production 集成、UI 编排和 V1 new-game smoke。
- 19 个本次新增或修改的 JavaScript 文件全部通过 `node --check`。
- 5 个本次 production JSON 全部通过 `JSON.parse`；Event Schema、目录和概率配置 validator 均通过。
- 生成器 `--check` 通过并再次证明源工作簿哈希不变；`git diff --check` 通过。

### 浏览器验收状态

- 本地 HTTP 服务下 V2 与 V1 页面均返回 HTTP 200；该结果只证明静态服务可达。
- 已按应用内浏览器技能进行能力探测，但当前任务未暴露该技能强制要求的浏览器 JavaScript 控制端点，无法合法执行实际点击、DOM、Network 或 console 检查。
- 在共享品质和形态权重最终调整后，负责人确认已完成真实浏览器验收，包括 V2 实际觉醒和 V1 回归；该结论记录为负责人实际验收，不冒充 Codex 自动浏览器控制结果。
- V1 自动化 `existing new-game smoke continues to create Player v1` 同时保持通过。

### 当前边界

- 本轮未实现特殊天赋、正式 0 岁开局、0～5 岁、学院、魂环、战斗、存档或其他任务书排除内容。
- V1 入口和 V1 内容保持独立；没有修改 `index.html`、`js/app.js`、`js/game.js` 或 V1 事件数据。
- Day 15 实现完成时先按原授权停在未暂存状态；负责人完成真实浏览器验收后，另行授权 Git 交付收尾。原任务书和 `outputs/` 负责人材料继续排除在实现提交之外。

## Day 16 - 2026-08-12 - 战力规则目录与天赋系统对齐

### 本日范围

- 依据负责人提供的 `battle_power_template.xlsx` 整理现有战力计算模式，建立可审计的规则目录。
- 依据补充示例 `powerv01.docx` 修正并确认选定等级锚点和验收案例。
- 阅读负责人提供的 `talent.docx`，完成天赋系统规则提取、问题对齐，并按确认后的边界实现独立天赋运行时。
- 继续保持 V1 与 V2 的边界、源材料和未授权文件不变；本日没有 staging、commit 或 push。

### 源材料

- `battle_power_template.xlsx`：工作表 `战力模板`，使用范围 `A1:N21`，无公式；SHA-256 为 `31BD174DD33AB3B3FB85C0CD5FB03FB075DF0C0E62ABDB738E0A01AF30166700`。
- `powerv01.docx`：补充等级示例；SHA-256 为 `743414FF57CEFFD33ADD16169B379F8EAA99B64759F6DD16EDC1DE4ADD21875B`。
- `talent.docx`：天赋系统来源；SHA-256 为 `AC700291F6CA47275A939EDF4749475F0413569069DC06920924B3623A83A1B9`。
- 用户源文件未被覆盖或重新保存。

### 战力规则与实现

- 新增 `data/rules/combat.json`，登记正式表格、补充文档、规则目录版本和 `confirmed`/`partial`/`provisional`/`unresolved` 状态。
- `data/config/combat-power.json` 升级为 `combat-power/2.0`，补充等级显式最终锚点、0级 `civilian_observer` 基座、多神位神装效率、固定魂环槽位和混合血脉字段。
- 0级作为独立平民旁观路线：仍可拥有武魂，但 `level=0`、成长锁定、静态战力固定0、永久不参与战斗；完整独立特别剧情尚未建立。
- 0～10级采用正式表格；`powerv01.docx` 确认的锚点为11=12、21=33、29=57、31=61、41=105、51=156、61=217、71=288、81=370、91=480、96=610、98=710、99=760、100=1260。未列等级保留兼容曲线并产生 unresolved warning，不再隐藏旧版99级累计220和100级490奖励。
- 764年魂环按正式表格改为6点；500～999年区间统一为6。神级金色魂环固定1000，人类第10～16魂环固定1000。
- 领域、属性、魂核、技能、道具等按等级战力为基数，模块独立、分别计算；正向百分比先合并再舍入，不做链式复利。魂兽血脉表中明确的 `low=-50%` 仍保留为血脉负向系数，不能与表格区间符号混淆。
- 魂兽修为规则目录采用相邻表格锚点分段线性推导并 `Math.round`，10～30000年覆盖；30000年以上和完整 `soul_beast_cultivation` 运行时仍待补充。
- 混合血脉允许多条血脉，百分比总和必须100%，按百分比加权倍率；非法总和产生结构化 warning。
- 神装部件按总倍率×3；多神位先合并神装小计，再按1/2/3/4神位分别应用100%/80%/60%/40%，神位和神器仍独立叠加。
- 91级、96级、98级相关案例修正为831、1241、1662；100级海神案例属性修正为895，总战力修正为14318。
- 更新 `docs/COMBAT_POWER_SYSTEM.md`、`docs/PLAYER_STATE_V2.md`、`js/combat-power.js`、0级迁移/觉醒/UI路径和相关测试；新增 `test/combat-power-catalog.test.js`。

### 天赋文档阅读与对齐

- `talent.docx` 结构化读取完成：91个非空段落、0个表格、1个 section；没有批注、脚注、尾注、页眉页脚、图片或修订记录。
- 因环境缺少 `soffice`/LibreOffice，`render_docx.py --emit_pdf` 未能完成，天赋文档视觉版式保持未验证；本日只依据结构化文本完成对齐。
- 天赋等级与战力系统独立。先天魂力映射为：0→F、1→E、2/3→D、4/5→C、6/7→B、8/9→A、10→S、20→god-level；原文存在 `c/C`、`s/S` 大小写差异。
- 90级前成长池暂定等概率：E为-5/-2/-1/+0/+1/+2；D为-2/-1/+0/+1/+2/+3；C为-1/+0/+1/+2/+3/+4；B为+0/+1/+2/+3/+4/+5；A为+1/+2/+3/+4/+5/+6；S为+2/+3/+4/+5/+6/+7；god-level为+3/+4/+5/+6/+7/+8。
- 减号确认是真正退步；不允许跨大等级下降；十位数不变、个位数最低为1、全局最低为1。乡下平民移除负向选项，剩余选项暂按等概率重分布。0级不进入普通年度成长池，走独立平民旁观路线。
- 90级以后魂核凝聚成长池明确暂定、先空置，不实现。
- 身份在出生时抽取，独一无二且排他。已对齐乡下平民、魂师子女、皇家骑士团团长子女、贵族子女、皇室、一无所有者、宗门子女、神之子、神明转世、重生者、穿越者、气运之子的限制和加成：皇家骑士团团长子女的两个+1都生效；气运之子额外机会可叠加；宗门限制触发时替换为普通成长并重新生成同名普通结果；重生者的同名实体重新生成，不直接复用上一世对象引用。
- 特殊天赋池、机会池和遭遇型成长池单独建立；首版保持空置并标记 `unresolved`，不自行补写内容。

### 天赋系统独立实现

- 新增 `data/rules/talent.json` 和 `data/config/talent.json`，保留 `confirmed`、`provisional`、`unresolved` 边界；先天魂力映射、身份条目和普通成长池均可审计。
- 新增 `js/talent-system.js`：天赋等级映射、出生身份等权抽取、身份修正、普通成长、负向大等级下限、0级旁观路线、91级魂核池未决返回、特殊/机会/遭遇池独立处理，以及重生实体新实例生成。
- 大等级按 `1–10、11–20、21–30、31–40…` 分段；负向成长使用 `floor((currentLevel - 1) / 10) * 10 + 1` 作为当前分段最低值，`21-5` 保持21，`31-5` 保持31；90级仍使用普通池，91级起魂核池空置。
- 皇家骑士团团长子女的两个 `+1` 均计入年度结果；气运之子的机会抽取数量支持叠加；宗门子女受限时按同名普通结果替换；重生者实体深拷贝并生成新的 `instanceId`。
- 新增 `test/talent-system.test.js` 和 `docs/TALENT_SYSTEM.md`；本轮不修改既有战力文件、Player v2 或年度流程。

### 临时魂环抽取 Demo（全量 provisional）

- 新增 `data/config/soul-ring-demo.json`、`js/soul-ring-demo.js`、`soul-ring-demo.html`、`js/soul-ring-demo-app.js`、`test/soul-ring-demo.test.js` 和 `docs/SOUL_RING_DEMO.md`，建立独立的手动可玩流程；本 Demo 不接入 V1/V2 Player、年度流程、战力计算或存档。
- Demo 只读 `data/reference/legacy-wheel/wheels.normalized.json`，明确保留 `REFERENCE DATA ONLY` 和 `productionEligible: false`；旧版参考资料、任务书和 outputs 材料未被改写。
- 槽位 1～9 按旧版标题寻找来源轮盘；多条路线要求手动选择；标题包含“第二武魂”的轮盘排除；第八魂环没有可识别旧版来源时保留未决。
- 正权重且无 `null` 权重的旧版轮盘可临时按显式权重抽取；零权重项保留但不可选，`null` 权重和混合权重只允许手动选择，不猜测概率。
- 年限从旧版文本临时解析；范围和未解析文本要求手动输入。18000 年只作为显式自动化测试夹具，浏览器配置禁止自动注入。
- 等级 0 直接忽略魂环流程并结束；非 0 流程以 10 级作为临时触发门槛。吸收成功与失败都结束本次 Demo，只有成功把临时魂环写入 Demo 内存状态。
- 以上所有新增 Demo 规则、状态、结果和过场记录均标记 `provisional`，不得升级为正式生产规则；正式魂环触发、路线、年限概率、魂兽/品质、吸收公式和生产接入继续未决。

### V3 最简人生 Demo（全量 provisional）

- 新增 `data/config/v3-demo.json`、`js/v3-demo.js`、`v3-demo.html`、`js/v3-demo-app.js`、`test/v3-demo.test.js` 和 `docs/V3_DEMO.md`，建立独立的 0 岁身份、6 岁天赋、逐年修炼、整十突破、魂环/魂骨和100级战斗终局链。
- V3 直接复用独立天赋运行时；身份在0岁抽取并立即生效，6岁按 V3 临时等权先天魂力值抽取并映射天赋等级；天赋等级仍不并入战力系数。
- 新增 V3 的 `production_runtime_isolated` 武魂接线：6岁非0级角色将已结算先天魂力传给现有生产觉醒运行时，读取 `data/v2/content/age-6-awakening.json`、`data/v2/catalogs/martial-souls.json` 和 `data/v2/config/awakening-probabilities.json`，生成独一无二的 `martialSouls` 实例；V3 编排仍标记为 `provisional`，不改正式武魂生产链规则。
- 90级以前每次点击推进一年并调用现有普通成长池；91级以后不填充正式魂核池，使用 V3 专属 `+1/年` provisional 过渡夹具走到100级。
- 10/20/30…90级按 V3 配置逐槽引用旧版魂环 Wheel；旧资料没有普通第八魂环，80级暂引用 `legacyWheelId=632` 的第二武魂第八魂环条目，并记录 warning。
- 每次整十突破按临时5%概率触发魂骨事件，命中后引用旧版 `legacyWheelId=71` 的魂骨奖励项；这不是正式魂骨掉落概率或奖励规则。
- 100级使用现有战力计算器得到 V3 临时履历战力，与固定战力1500的比比东比较；胜负两种结果都写入终局并结束 Demo。
- V3 页面改为单一“抽取并推进一年”按钮：首次点击抽0岁身份并到1岁，之后每次只推进一年；6岁天赋、武魂觉醒、整十突破、魂环/魂骨事件和100级战斗都在对应推进点击中完成，并在每次点击前播放转盘动画。主区只显示转盘、按钮和当前事件；状态、武魂、魂环魂骨、规则和审计记录放入可折叠侧栏。
- 当前事件改为直接读取 `talent.docx` 对应 E/D/C/B/A/S/god-level 普通成长条目的完整 `narrative` 原文，覆盖全部正向、零增长和负向结果；突破、魂骨和终局战斗也写入当前事件。
- 身份配置和规则目录补充 `talent.docx` 的身份叙述，0岁抽取事件展示原文并立即生效；6岁武魂事件基于生产目录已有的名称、形态、品质和属性生成展示叙述，不改正式武魂目录。
- V3 转盘动画改为配置化 provisional `animation.durationMs=450`，UI 等待时间与 CSS 动画时长同步缩短；只改变展示速度，不改变 RNG 和抽取规则。

### 自动化验证

- bundled Node.js 完整测试：161 tests、161 pass、0 fail、0 skipped；其中天赋系统12项、临时魂环 Demo 11项、V3 Demo 11项和现有生产觉醒链全部通过。天赋测试增加了全量成长/身份文案覆盖，V3 覆盖身份、武魂、年度文案、1500战力终局和动画配置边界。
- 非空 JSON 解析（27个文件）、JavaScript 的 `node --check`（42个文件）和 `git diff --check` 通过；仓库原有10个空 JSON 源文件保持未修改。
- 自动化覆盖战力规则目录、等级锚点、0级旁观路线、764年修正、正向系数合并、混合血脉100%约束、多神位神装效率、99级和100级验收夹具、天赋规则、临时魂环 Demo，以及 V3 的0岁身份、6岁天赋、逐年成长、整十突破、旧轮盘魂环/魂骨、0级终态、100级战斗成功/失败和输入隔离。
- 本日没有新的真实浏览器点击、DOM、Network 或 console 验收；Demo 页面尚未做 Codex 自动浏览器验收，自动化通过不等于浏览器验收通过。

### 当前未决与边界

- 天赋系统已作为独立系统编码，不把天赋等级并入战力；Player v2 和年度流程接入仍未授权且未实施。
- 临时魂环 Demo 仅为 provisional 可玩验证；正式魂环抽取流程、旧版 WheelID 后继关系、年限概率、魂兽/品质、吸收成功率和生产接入仍未确认。
- V3 最简人生 Demo 仅为 provisional 试玩链；90级后 `+1/年`、5%魂骨事件、固定战力1500比比东、旧轮盘逐槽选择和普通第八魂环缺口的临时补位均不得视为生产规则。
- 魂核“年限战力”具体基数、武魂真身独立规则、魂兽30000年以上范围仍未确认。
- 0级独立特别剧情仍未实现；当前只有状态、迁移和战力非战斗边界。
- “十位数不变、个位数最低为1、不能跨大等级下降”已由用户进一步确认并实现为当前大等级最低值；20/30仍属于前一大等级最高，21/31/41为后续大等级最低。
- 源文档中 D级选项、三个身份文本存在段落拼接，“走火入腐”疑似错字，一处多余引号；本日未修改用户源文档。
- 已生成完整交接文件：`docs/tasks/DAY16_CHAT_HANDOFF_2026-08-12.md`，供下一对话同步。

### 2026-08-13 - Day16 收尾记录

- 负责人确认本日工作可以收尾；V3 Demo 继续保持独立、可玩、全量 `provisional`，不升级为正式生产规则。
- 日常修炼已接入 `talent.docx` 的 E/D/C/B/A/S/god-level 全部42条文案；0岁身份和6岁武魂抽取均有当前事件叙述；比比东固定战力为1500，转盘动画为450ms。
- 最终验证：161 tests、161 pass、0 fail、0 skipped；42个 JavaScript 文件通过 `node --check`；未自动修改源文件、任务书或 `outputs/`。
- 后续仍未决但不阻塞本 Demo 收尾：正式魂环抽取规则、特殊/机会/遭遇型成长池、91级后魂核成长池、0级特别剧情，以及 V3 是否升级为正式生产链。

## 2026-08-17 - APK 正式路线运行时批次与发布准备

### 今日目标

- 在保留 APK 原始可用性、动态边界和来源证据的前提下，继续推进正式路线 Demo 的 typed route runtime。
- 将上一轮人工验收发现的正式特殊成长战力边界接入 APK 来源计算，并用自动化测试锁定成功、失败和阈值边界。
- 整理今日实现、证据、测试和人工验收状态，准备进入版本发布流程。

### 今日完成

- 完成 APK 正式特殊成长结果的战力总值审计：确认来源处理器调用 APK `combatPower.total`，并保留 `>=`、`>` 两种比较语义、失败效果、死亡阈值和战斗失败标记。
- 新增 APK 战力来源证据包 `data/apk-canonical/catalogs/combat-power-runtime-evidence.json`，记录等级、魂环、武魂、属性、领域、魂核、魂骨、神装、道具、状态和舍入相关来源常量；证据仅来自静态源映射，未执行 APK 游戏逻辑。
- 新增 `js/apk-combat-power-runtime.js`，并接入 `js/apk-route-runtime.js`、`js/production-content-loader.js`、`js/apk-route-demo-app.js` 和 `data/production-entry.json`。
- 补充正式特殊成长战力的精确阈值成功、低于阈值失败、失败铜灵币封顶和缺少证据包硬边界测试。
- 延续并整理 APK 路线图、scheduler、特殊成长、人类魂环年限/类型/物种和正式武魂 handler 的来源证据、typed runtime 与审计报告。
- 保持“当前边界不静默补全”策略：scheduler 已完成人工验收；本轮浏览器继续推进后，明确停在 `humanRingSpecies4` 的 APK 共享 handler 分支。

### 当前人工验收边界

- 固定 seed `apk-route-demo-seed` 已推进到 21 岁、32 级、`humanRingSpecies4`，选项 `bddfef`（土龙）。
- APK 原始 `applyHumanMartialSoul` 并非只负责追加武魂；它在 `humanRingSpecies3/4/5` 中负责完成魂环物种选择、写入魂环并应用物种属性效果。
- 当前 typed runtime 已覆盖正式武魂追加分支，但尚未把这个共享 handler 按 flow 分派到魂环物种收束分支，因此正确停在 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，没有静默增加武魂或魂环。
- 本次停点游标从 83 到 84，而已提交结果仍为 83，说明本次选项尚未提交；下一批应复用现有魂环物种证据和 `finalizeSoulRingSpecies` 语义，补充共享 handler 分派与回归测试。

### 自动化验证与交付状态

- bundled Node.js 全量测试：218 tests、218 pass、0 fail、0 cancelled。
- 战力证据包、APK canonical package index、production entry 和生成器之间的来源哈希已重新生成并校验。
- 本日新增的战力适配器已完成自动化验证；浏览器验收继续保留真实边界，未将当前 `humanRingSpecies4` 停点误报为通过。
- 审计报告：`outputs/parallel-prep-2026-08-16/APK_SPECIAL_RESULT_COMBAT_POWER_AUDIT_2026-08-17.md`。
- 本条记录只描述已完成实现、自动化验证和当前未决边界；不将 APK 静态候选或未接入分支升级为生产规则。

### 2026-08-17 收束更新：来源、战力、共享 handler 与验收边界

#### 本地自动验证

- 所有 APK 提取器和 canonical package generator 共用固定来源 SHA：`E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`；manifest、policy、package index、route graph 和全部 runtime evidence 已由生成器重新生成，并由一致性测试逐项校验。
- `applyHumanMartialSoul` 已改为显式 operation registry：`formal-human.martial.*` 进入 `addMartialSoul`；`humanRingSpecies3/4/5` 进入共享魂环物种收束 primitive；awakening、replacement、beast 分支继续返回明确的 unresolved typed boundary。另将 `douluo1:handler.official-beast.element` 按官方魂兽 flow 单独登记为 `beast.element.unresolved`，不再落入未分类 handler 错误。
- 共享收束 primitive 已覆盖 `setSoulRing`、物种属性 effects、海魂环 water 特殊效果和副武魂补环批次状态；新增第四魂环、主/副武魂补环、缺 pendingRing、缺 species evidence、未知 flow 的参数化和原子回滚测试均通过。
- 重新调查固定 seed 后，物种证据生成器补齐了 APK `pt(wt(...))` 明确返回空 effects 的正式选项：总记录从 107 条变为 231 条，其中 124 条标记为 `source-verified-no-explicit-attribute-effect`；没有手写属性或跳过路线。
- 本地固定 seed 回放已验证第 1--83 项摘要保持不变：第 83 项为 `humanRingType3/838519`，第 84 项为 `humanRingSpecies4/bddfef`；第 84 项提交后为 21 岁、32 级、cursor/history=84、第三环 2000 年、土属性=2、武魂数仍为 1。
- 本地继续推进第 84 项之后，第 85 项 `b52e1b` 正常回到 `humanPlan`；下一 typed boundary 出现在抽取第 219 项：`douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577 / f16385`，错误为 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，并带 `operationId=beast.element.unresolved`、`operationStatus=unresolved`；当时 cursor=219、已提交=218、58 岁/91 级。APK 源码虽提供元素映射和 `after-element` resolver，但本轮按 beast 分支范围保持未接入。
- 战力差分表覆盖人类/魂兽、神装 100 级门槛、血脉、称号、状态、魂环、魂骨和神器；已修复魂兽称号倍率与人类 100 级神装门槛。覆盖范围外的状态由 `APK_COMBAT_POWER_UNCOVERED_STATE` 阻断，不返回近似总值。差分表见 [`docs/review/APK_COMBAT_POWER_DIFFERENTIAL_TABLE_2026-08-17.md`](review/APK_COMBAT_POWER_DIFFERENTIAL_TABLE_2026-08-17.md)。
- bundled Node.js 全量测试：`245 passed, 0 failed, 0 cancelled, 0 skipped`；满足本轮不少于 218 项的验收线。PR #4 仍为 open Draft，未合并、未切换 Ready、未 force-push。

#### 浏览器验证

- 先前真实页面回放发生在证据包重新生成前：clean seed 在第 19 项抽取到 `humanRingSpecies6 / 86a2d7`，页面为 `drawn`、2 岁/10 级、cursor=19、已提交=18，并正确停在 `APK_ROUTE_SOUL_RING_SPECIES_EVIDENCE_MISSING`。该结果保留为旧包边界记录，不代表当前修正后的浏览器结果。
- 证据包重新生成后，负责人从 `file:///D:/0CODE/douluo-life/apk-route-demo.html` 的真实页面完成第 84 项验收：页面状态 `ready`，当前 flow 为 `humanAfterSoulRing`，年龄/等级 `21 / 32`，铜灵币 `30180`，cursor/history 均为 `84`；页面显示土龙选项已抽取完成，下一 flow 为 `humanAfterSoulRing`。
- 负责人继续从同一浏览器会话重放到下一处真实边界：页面状态 `drawn`，当前 flow/pool 为 `douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577 / f2abac93-6b26-4e3e-aa92-a168db671577`，年龄/等级 `58 / 91`，铜灵币 `72640`，cursor `219`，已提交 `218`；页面明确显示 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，option `f16385`，customHandler `douluo1:handler.official-beast.element`。本次只记录页面实际显示的路线状态；魂环详细 JSON、土属性计数和武魂数量仍以本地自动化断言为准。
- 上述第 219 项浏览器回放发生在本次 registry 诊断增强前；增强只改变 unresolved 错误的结构化细节，不改变已到达的 flow、pool、cursor 或提交计数，因此没有把新增 `operationId`/`operationStatus` 伪记为浏览器证据。
- 负责人随后刷新页面并重新回放到第 219 项，取得新增字段的真实浏览器证据：页面仍为 `drawn`，flow/pool、年龄/等级 `58 / 91`、铜灵币 `72640`、cursor `219`、已提交 `218` 均一致；错误消息为 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，details 实际显示 `operationId=beast.element.unresolved`、`operationStatus=unresolved`，并保留 `customHandler=douluo1:handler.official-beast.element`。

#### 未决与排除

- 当前代码与生成包已修正第 19 项的“源中明确空 effects 被误判为缺证据”问题；第 84 项和下一处第 219 项边界已经取得浏览器证据。`official-beast.element` 现在有明确 registry unresolved 条目，但仍不得静默补全。
- 术语边界：当前 APK scheduler 在 32 级按 `floor(level / 10)` 目标为第 3 槽，因此 `humanRingSpecies4` 表示“第 4 类魂兽物种 flow”，本地第 84 项实际写入第三魂环。若验收必须是第四魂环槽，需要另有 checkpoint 或单独确认 scheduler 语义；本轮没有强行改成第四槽。
- PR #4 body 的收窄版文案已准备在 [`docs/review/APK_PR4_DESCRIPTION_2026-08-17.md`](review/APK_PR4_DESCRIPTION_2026-08-17.md)，本次授权发布步骤将同步到现有 PR；PR 状态保持 open Draft。
- packaging decision 已单独记录于 [`docs/review/APK_CANONICAL_PACKAGING_DECISION_2026-08-17.md`](review/APK_CANONICAL_PACKAGING_DECISION_2026-08-17.md)：先保留 generator 产出的 canonical JSON，再以 pack-level route shard 作为后续 release 方向；当前不生成或发布 Release artifact。
- APK、`apk-analysis/`、任务书、Word/Excel、archive、负责人生成输出和无关 `index.html` 不进入本次提交；仅纳入 canonical package 生成器/provenance、运行时、测试、生成后的审计 JSON 与收尾文档。本次授权范围包含显式 staging、commit、push 和 PR body 同步；不 merge、不 force-push、不重写分支。

### 2026-08-19：Preview 与 pack-shard 文件实现（A-FILE）

- 负责人选择 `D1-A / D2-B / D3-A`：发布范围限定为允许 typed boundary 的 preview，禁止完整路线声明；route graph 改用 compact、按 `douluo1` / `douluo2` 分片并按 pack 懒加载；首次未来 push 前必须把 Pages source 移出 Draft 分支。
- route graph extractor 同一次运行生成 compact monolith 与两个 `apk-route-graph-shard/1.0` pack shard。package generator 将 shard 的路径、入口 flow、字节数和 SHA-256 写入 package index，禁止运行时猜测 shard 路径。
- production loader 优先读取 index 列出的 pack shard，并物化为既有 runtime 接口需要的单-pack graph；只有旧 package 没有 shard metadata 时才回退 monolith。未知 pack 返回 `PRODUCTION_ROUTE_PACK_NOT_FOUND`。
- route Demo 首屏只加载 entry/index/policy；选择 pack 并开始时才加载该 shard及四类 runtime evidence。`catalogNames: []` 保持不请求 `options.json`。
- fixed seed shard 回归必须继续锁定前 83 项摘要、第 84 项 `humanRingSpecies4/bddfef` 和第 219 项 `beast.element.unresolved`；分片不授权实现 official-beast 成功路径。
- 本次生成结果：compact monolith `29,822,859` bytes；`douluo1` shard `14,268,485` bytes；`douluo2` shard `14,614,706` bytes。定向测试 `17 passed`；`npm.cmd test` 全量 `249 passed, 0 failed, 0 cancelled, 0 skipped`。
- `D3-A` 只形成 `A-PAGES-SOURCE` 外部授权门。本轮没有修改 GitHub Pages、PR、Git、Release 或部署配置；在 source 迁移完成前 Draft 分支保持 push freeze。

### 2026-08-20：浏览器 RC 范围收窄（A-FILE-RC）

- 全新本地页面 Network 验证：首屏未请求 compact monolith、任一 shard 或 `options.json`；启动 `douluo1` 后只请求 `route-graph.douluo1.json` 与四类 runtime evidence，均 HTTP 200、无加载失败。
- 浏览器固定 seed 重放再次确认第 84 项 `humanRingSpecies4/bddfef` 与第 219 项 `f16385 / beast.element.unresolved`；第 219 项 cursor=219、history=218，未把失败项写入提交历史。
- `douluo2` shard 与入口 `douluo2:flow.start` 可加载，但固定 seed 首步 `cd9337` 到达 `douluo2:handler.human.country` typed boundary，cursor=1、history=0；这不构成路线可推进证据。
- 负责人据此决定公开 preview 仅声明 `douluo1`；`douluo2` shard 保留为 `experimental / unverified`。production entry、package policy/index 与 Demo 必须共享该范围，两个 handler 均保持 unresolved，不实现成功路径。
- 范围修正后的定向测试 `17 passed`，`npm.cmd test` 全量 `249 passed, 0 failed, 0 cancelled, 0 skipped`。浏览器 smoke 显示选择器为 `douluo1 · 公开 preview` / `douluo2 · 实验/未验证`；选择 douluo2 后页面明确提示入口与后续路线均未验证。
- `A-FILE-RC` 不包含 Git、PR、Pages、Release 或部署动作；范围修正通过测试前不进入 `A-PAGES-SOURCE`。

### 2026-08-20：Pages source 迁移与文件收尾（A-PAGES-SOURCE / A-FILE-CLOSEOUT）

- `A-PAGES-SOURCE` 已独立完成：GitHub Pages source 从 `codex/day14-release-closeout / (root)` 迁移到 `main / (root)`；`pages build and deployment` run `32360588072` 从 `main` 的 `c7d2978ea8a3e9063f99e31cdcb1b4cf448f1137` 部署成功。
- 新鲜公开页面 smoke 正常显示“斗罗人生模拟器 / v0.0.1 Alpha”。当前公开站点仍来自 `main`，不是本地尚未提交的 Preview RC。
- Draft 分支后续 push 不再直接改变公开 Pages，先前的 push freeze 已解除；push、PR body 修改、Ready、merge、tag 和 Release 仍分别需要独立授权。
- merge 到 `main` 会自动触发公开部署，因此未来 `A-MERGE` 必须明确包含这一外部影响。
- package generator 的 Pages 字段由一次性待办改为稳定约束 `stable_source_required_draft_branch_excluded`；`package-policy.json` 与 `package-index.json` 必须由生成器重新生成，不手改产物。
- PR #4 的待同步 body 草案更新为 249 项自动化测试、compact route shards、`douluo1` 公开 Preview、`douluo2` 实验/未验证、浏览器 RC 和 Pages source 完成状态；本次文件授权不包含远端 `A-PR-EDIT`。
- 收尾生成器执行结果为 `status=pass`、`fileCount=22`；generator/policy/shard SHA 校验一致，18 个精确任务路径的 `git diff --check` 通过，`npm.cmd test` 全量 `249 passed, 0 failed, 0 cancelled, 0 skipped`。

## Day 17 - 2026-08-20 - 项目拨乱反正与 V0.5 主线重建

### 触发原因

- Day 1～Day 16 一直使用“一个 Day、一个玩家可见目标、一个明确边界”的管理方式；Day16 后虽然技术工作继续推进，但没有正式建立 Day17。
- 当前 `codex/day14-release-closeout` 已同时承载 Day15、Day16、APK canonical runtime、route graph、战力适配、分片、懒加载和发布准备，分支名、PR 范围和项目阶段不再一致。
- 249 项自动化测试证明了大量技术子系统，但不能回答“玩家现在能完成哪一段正式人生”。
- README、旧交接、DEVLOG、本地 PR body 草案和远端 PR 状态存在时间层级差异，项目缺少单一当前状态入口。

### 只读检测结论

- 公开 Pages 仍来自 `main@c7d2978`，默认入口是 V1 `v0.0.1 Alpha`，不是本地 Preview RC。
- V2 的正式玩家内容仍以 6 岁 production 武魂觉醒和 7 岁内容边界为稳定切片。
- V3 是可玩但全量 provisional 的较长人生 Demo。
- APK Route Demo 已具备来源追溯、typed runtime、固定 seed 回放和明确 unresolved boundary，但尚未被收束成单一、易理解的版本目标。
- PR #4 仍为 open Draft，head 为 `cd47941`，包含 5 commits、125 files 和约 501 万 additions；没有 reviews 或 review threads，connector 未发现 commit statuses 或 PR workflow runs。
- PR head 的 `data/production-entry.json` 引用了未进入远端 Git 的 `data/v2/archive/apk-replaced-2026-08-16/manifest.json`；远端路径返回 404。该项不在 Day17 修改，但被登记为 Ready/merge 前阻塞。

### 负责人最终决定

负责人选择方案 B：

- 以 APK canonical 资产、规则和路线为正式 V0.5 主线；
- 尽快交付一版可玩的 Demo V0.5；
- 项目管理恢复既有分 Day 模式；
- V1、V2、V3、临时 Demo、旧规则目录、APK 原文件、archive、outputs 和其他 owner 材料全部保留；
- 不为切换主线覆盖、删除或清理既有资产；
- V0.5 使用独立入口，复用 canonical 数据，不复制第二份数据真源；
- V0.5 唯一正式 pack 为 `douluo1`；
- 25 岁作为 V0.5 明确终点；
- `douluo2`、25 岁后路线和 `official-beast.element` 不阻塞 V0.5；
- 默认固定 seed 必须稳定到达25岁，自定义 seed 未接逻辑继续 typed stop。

### Day17 文档交付

- 新增 `docs/CURRENT_PROJECT_STATUS_2026-08-20.md`，作为当前唯一状态入口。
- 新增并收口 `docs/tasks/DAY17_PROJECT_REBASELINE_TASK.md`，记录方向选择、Stop/Go 和独立授权门。
- 新增 `docs/tasks/DAY18_APK_V05_PLAYABLE_DEMO_TASK.md`，将下一玩家可见目标限定为 `douluo1` 从正式入口连续推进到25岁总结。
- 旧目标草案和历史任务书保持原样，不覆盖、不删除；它们继续作为历史决策与备用资产。

### 验证与授权边界

- 本次拨乱反正只修改上述状态、Day17、Day18 和 DEVLOG 文档，没有修改功能代码、配置、数据、生成器或测试。
- 立即此前的只读审计已重新执行 `npm.cmd test`，结果为 `249 passed, 0 failed, 0 cancelled, 0 skipped`；本条记录不把该本地结果描述为 CI 或 V0.5 验收。
- PR #4 继续保持 Draft；本次没有 stage、commit、push、PR 修改、Ready、merge、tag、Release 或 Pages 操作。
- Day18 实现前必须先执行 `A-DAY18-AUDIT`，定位默认 seed 的精确25岁 transcript、必经 handler 和文件范围；实现另需 `A-FILE-V05`。

## Day 18 - 2026-08-20 - APK canonical `douluo1` V0.5 文件实现

### A-DAY18-AUDIT

- 使用 compact `douluo1` shard 和默认 `apk-route-demo-seed` 只读重放。真实入口为 package 声明的 `douluo1:flow.formal-human.identity`，不是任务书示意文字中的 `douluo1:flow.start`。
- 第 100 项 `douluo1:flow.formal-source.c9944ade-310d-41eb-b8ea-01723cab952c / c9944ade-310d-41eb-b8ea-01723cab952c / fff9f5` 完整提交后，角色首次从24岁推进到精确25岁；等级41→42，cursor/history/routeHistory 均从99→100，下一 flow 为 `douluo1:flow.formal-special-growth`。
- 前100项 transcript 的 SHA-256 为 `967347b48f6680be71b1f33d18c52f392519afd4c7afb5255beae20a74531391`；25岁前没有 typed unresolved。
- 审计确认核心 runtime 在25岁后仍为 ready；若再 draw 会先把 cursor 从100消耗到101。因此25岁必须作为薄控制层的展示终点，在完整提交后判断，并在任何下一次 draw 前封锁。
- `legacyArchive.manifest` 虽在 PR head 悬空，但 production loader 不读取该字段，不是 V0.5 运行依赖；它仍保留为 PR Ready/merge 前独立阻塞。

### A-FILE-V05

- 新增 `v05-demo.html`，建立不替换任何旧入口的 `douluo1 / V0.5 / 0～25岁` 玩家页面。
- 新增 `js/v05-demo.js`，复用现有 APK route runtime，提供单步提交、按年龄受控连续推进、取消、重置、typed boundary、精确25岁完成锁和完成摘要；没有建立第二套 route engine。
- 新增 `js/v05-demo-app.js`，首屏只读取 entry/index/policy，开始人生后固定请求 index 列出的 `douluo1` shard 与四类 runtime evidence；不请求 `douluo2`、`options.json` 或 monolith。
- 新增 `test/v05-demo.test.js`，锁定默认 seed 第100项、transcript digest、完成后零额外 cursor/history、单步与连续推进同态、busy/cancel 防重入和单-pack 拒绝规则。
- 自定义 seed `v05-custom-1` 在17岁第95次 draw 命中 `beast.element.unresolved`；cursor=95、history=94，失败项未提交，随后重复推进被 boundary 状态阻止。
- 新增 `docs/V05_DEMO.md`，记录入口、产品范围、加载边界、自动化证据、浏览器未验证项和独立授权门。
- V0.5 定向回归 `15 passed`；完整 `npm.cmd test` 为 `255 passed, 0 failed, 0 cancelled, 0 skipped`。精确7文件的 `git diff --check` 通过，仅报告既有 DEVLOG LF→CRLF 提示。

### 当前边界

- 本轮只修改 `A-FILE-V05` 确认的7个文件；未修改 canonical 数据、核心 runtime、loader、生成器、archive、owner 材料或旧入口。
- 当前证据为本地文件实现与自动化，不是浏览器、GitHub CI、PR review 或 Pages 证据。
- 本轮没有 stage、commit、push、PR 修改、Ready、merge、tag、Release、artifact 或 Pages 操作。
- 下一授权门为 `A-BROWSER-V05-RC`。

### A-BROWSER-V05-RC / A-FILE-V05-RC-LOG

- 使用 Codex in-app Browser 从全新 `http://127.0.0.1:8080/v05-demo.html` 执行真实验收。页面明确显示 `斗罗人生 V0.5 / 斗罗大陆 I / 0～25岁`，默认 seed 为 `apk-route-demo-seed`。
- 首屏 Network 只请求页面模块、`production-entry.json`、package index 和 package policy；开始人生后只新增 `route-graph.douluo1.json` 与四类 runtime evidence。全部响应 HTTP 200，没有 loadingFailed，也没有请求 monolith、`douluo2`、`options.json` 或 `legacyArchive.manifest`。
- 单步点击后页面为0岁/1级、铜灵币500、cursor/history `1/1`，当前 flow 精确推进到 `douluo1:flow.formal-human.gender`，事件叙事和 history 第1项可见。
- 重置后使用“推进至下一岁”逐岁点击，1～25岁检查点全部可见。25岁终点为42级、铜灵币29850、cursor/history `100/100`、currentFlow `douluo1:flow.formal-special-growth`；摘要显示铁角牛武魂及4个魂环。
- completed 后单步和连续推进按钮均禁用；额外强制触发没有改变 cursor、history、currentFlow 或 completed 状态。刷新后页面回到“等待开始”、角色与进度为空，没有伪装 save/load。
- V0.5 全程 console 没有 error 或 warning。390×844 窄屏下四个控制按钮按单列、等宽排列，开始人生和单步提交正常；测试后已恢复默认视口。
- V1 `index.html`、V2 `v2-demo.html`、V3 `v3-demo.html`、`soul-ring-demo.html` 和 `apk-route-demo.html` 均可真实打开，标题与主要内容可见，console 没有 error/warning。
- 临时本地静态服务、浏览器验收标签页和临时视口均已关闭或恢复；浏览器 RC 没有修改应用文件、Git、PR 或 Pages。

### Day18 当前交付边界

- V0.5 当前可准确描述为 `local implementation / automated-verified / browser-verified / not staged / not published`。
- 浏览器 RC 不构成 GitHub CI、PR review、Ready、merge 或 Pages 证据；PR #4 与公开 Pages 状态没有变化。
- 本次 `A-FILE-V05-RC-LOG` 只同步 `docs/V05_DEMO.md`、当前状态页和 DEVLOG，不修改功能、测试、canonical 数据、runtime、loader、生成器、archive 或 owner 材料。
- 进入 Git 前必须先核对混合工作树和 compact packaging 前置资产的精确交付范围；stage、commit、push 继续分别授权。
## Day 19 - 2026-08-24 - V0.5 RC1 focused package 文件收口

- 负责人选择 PR 方案 B，并从 `main@c7d2978` 建立独立 `codex/v05-rc1` worktree；原混合工作树未作为本轮写入目标。
- 文件白名单由 44 路径经 `A-FILE-DAY19-RC-ARCHIVE-CLOSURE` 精确扩展为 47 路径，只新增三个 archive preservation 原路径。
- archive option 2 保留 `martial-souls.json`、`awakening-probabilities.json`、`age-6-awakening.json` 的 e17ec72 原字节；manifest 的 `archivedAt=2026-08-16` 与 owner-authorized migration replacement reason 由生成器强制校验。
- 新生成 `data/v05-rc/production-entry.json`、`package-index.json` 与 `package-policy.json`。V0.5 runtime 只允许 `douluo1` shard 与四类 evidence；martial-soul evidence 仅为 build input，三个 archive 文件仅为 preservation，均不进入 runtime 请求。
- V0.5 页面改用 RC 专用 entry path；route/combat/fixed-seed 测试改为 materialize `route-graph.douluo1.json`，不恢复 monolith。
- 新增 RC package/archive 生成一致性测试与 adapter 聚焦测试；8 个 focused 测试文件为 83 passed、0 failed，generator `--check` 通过。
- 完整 `npm.cmd test` 为 155 passed、20 failed（175 total）。20 项失败全部集中在旧 V2 age-6 awakening / production playtest：`main@c7d2978` 的旧 V2 engine/registry 与 archive option 2 强制保留的 e17ec72 `age-6-awakening.json` 接口不配套。白名单内不能同时保持精确字节和修复旧 V2 依赖，故当前不是 Ready。
- 47/47 路径审计通过，无第 48 路径；25 个 e17 LOCK 文件字节复核为 0 mismatch，archive manifest 另与原工作树 SHA-256 `D690D706D01DDDA8C16386270E618E0EDBE7E7BBB16DA9AA92AEFC05A8C93EBA` 对齐。当前尚未 stage、commit、push、创建/编辑 PR 或操作 Pages。
### A-DAY19-ARCHIVE-2R

- 负责人将 archive option 2 调整为 2R：manifest 保留三个 `originalPath`，实体原字节迁移到 `data/v2/archive/apk-replaced-2026-08-16/` 对应 `archivePath`。
- 三个 archivePath 副本逐一保持 e17ec72 SHA-256；两个在 `main@c7d2978` 不存在的活跃文件已移除，活跃 `data/v2/content/age-6-awakening.json` 恢复为 main 基线哈希 `ED35D2D298D612CCEBE2D117E19F799D451700BF5C58011CBFA0380CC8B8CE4A`。
- manifest 的 `archivedAt=2026-08-16` 与 replacement `reason` 语义不变；`preservationPolicy` 更新为 `retain_original_bytes_with_path_mapping`。生成器与测试改为校验 originalPath/archivePath 映射、archivePath 实体哈希和 runtime exclusion。
- 路径总数仍须为 47，不增加第 48 路径；focused/full tests 与生成器 check 将在 2R 文件同步后重新运行。
- 2R generator write/check 均通过；8 个 focused 测试文件为 83 passed、0 failed；完整 `npm.cmd test` 为 175 passed、0 failed。方案 2 的 20 个旧 V2 失败已全部闭合。
- 自动化全绿不构成当前 checkout 的浏览器、GitHub CI、PR review、Ready、merge 或 Pages 证据；本轮仍未 stage、commit、push 或修改远端状态。

### A-BROWSER-DAY19-RC / A-FILE-DAY19-RC-BROWSER-LOG - 2026-08-25

- 使用 Codex in-app Browser 从新鲜 `http://127.0.0.1:8080/v05-demo.html` 验收当前 `D:\0CODE\douluo-life-v05-rc1` checkout。页面正确显示 `V0.5 RC1 / douluo1 / 0～25 岁`。
- 首屏页面模块与 `data/v05-rc/production-entry.json`、package index、package policy 全部 HTTP 200；开始人生后只新增 `route-graph.douluo1.json` 与四类 runtime evidence。`loadingFailed=0`，没有请求 monolith、`douluo2`、`options.json`、archive manifest 或三个 archive 实体。
- 单步提交后为0岁/1级、铜灵币500、cursor/history `1/1`、flow `douluo1:flow.formal-human.gender`。逐岁检查点完整覆盖1～25岁。
- 25岁终点为42级、铜灵币29850、cursor/history `100/100`、currentFlow `douluo1:flow.formal-special-growth`；摘要显示铁角牛武魂与4个魂环。完成后单步及连续推进按钮均禁用，第100项之后没有新的 draw。
- 刷新后页面恢复“等待开始”，角色、进度与 history 清空；390×844 下四按钮单列等宽、无横向溢出，开始与单步正常；全程 console error/warning 为0。
- 临时视口、标签页和 HTTP 服务已清理。本次日志授权只更新本状态页、`docs/V05_DEMO.md` 与 DEVLOG；未改功能、测试或其他路径，未 stage、commit、push、修改 PR 或 Pages。

### A-FILE-DAY19-RC-READY-LOG - 2026-08-25

- 精确47路径已在独立授权下提交为 `e98bf8a9b9dfb91651a092f728388c835ac90ace`（`feat: prepare V0.5 RC1 focused package`）并普通 push 到 `origin/codex/v05-rc1`；本地、upstream 与远端 PR head 一致，ahead/behind 为 `0/0`。
- focused Draft PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5) 已创建，base 为 `main@c7d2978`，head 为 `codex/v05-rc1@e98bf8a`，共1 commit、47 files，当前为 `CLEAN / MERGEABLE`；PR #4 未被本轮修改。
- Ready 前重新运行 RC generator `--check`、8个 focused 测试文件与完整 `npm.cmd test`，结果分别为 pass、`83/83` 与 `175/175`；提交级 whitespace check 通过，focused 功能提交后的工作树干净。
- `e98bf8a` 没有 GitHub Actions run；仓库没有提交级 CI workflow、required checks、main branch protection 或 ruleset，仅有 GitHub Pages 系统部署 workflow。因此 CI 记录为 `unavailable / not configured`，不得写成 passed。
- PR review 记录为 `unavailable`：0 reviews、0 comments、0 review requests。Pages 仍由 `main / (root)` 发布 `main@c7d2978`，当前公开站点不是 V0.5；merge 会触发 Pages，但本轮没有 Ready、merge 或 Pages 授权。
- 当前 focused checkout 只包含 `index.html`、`v2-demo.html` 与 `v05-demo.html`。V3、临时魂环 Demo 和 APK Route Demo 保留在 PR #4/原混合工作树，属于方案 B 的 focused 拓扑排除，不伪记为 PR #5 checkout 浏览器通过。
- Ready 前结论为 `Conditional Go`：代码、archive 2R、自动化、提交范围与 focused 浏览器 RC 均已闭合；四文档状态同步完成后仍需分别授权精确 stage、commit、push，再复核 PR head，最后才可由独立 `A-READY` 决定是否转 Ready。
- 本次只修改 `docs/V05_DEMO.md`、`docs/CURRENT_PROJECT_STATUS_2026-08-20.md`、`docs/DEVLOG.md` 与 `docs/review/V05_RC1_PR_DESCRIPTION_2026-08-24.md`；DEVLOG 仅追加。未修改功能、生成器、测试、数据或 archive，未 stage、commit、push、修改 PR、转 Ready、merge 或操作 Pages。

### A-MERGE-DAY19-RC / A-HOTFIX-V05-SCROLL / A-DOC-CLOSEOUT - 2026-08-25

- focused RC PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5) 已转 Ready，并以 merge commit `67abd4785d5365c8c95816201ef4524688709b21` 合并到 `main`；Pages run [32752990658](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32752990658) 成功。
- 首轮公开验收发现每次推进都会触发页面级 `scrollIntoView`，使视口跳到 history 底部。hotfix 精确修改 `js/v05-demo-app.js`、`test/v05-demo.test.js`：移除页面级自动滚动并新增防跳底回归测试；focused `7/7`、完整 `176/176`、whitespace check 通过。
- hotfix commit `981af0f74142c956a4605a40a19d5b690fc3cb43` 经 PR [#6](https://github.com/MaxwellGuoDUT/douluo-life/pull/6) 以 merge commit `10d33a2bb0f3399df7a18c139848f4330a41ec35` 合并到 `main`；Pages run [32755367252](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32755367252) 成功。
- hotfix 后，Codex 公开自动浏览器证据确认开始新人生、shard-only Network、console 0、页面 scroll 不再跳底，并推进至21岁；最后一批调用超时，因此没有把其余项目写成 Codex 自动验证通过。
- 项目负责人随后在公开 [`v05-demo.html`](https://maxwellguodut.github.io/douluo-life/v05-demo.html) 完成人工验收，确认不再自动跳底，并通过0～25岁、Network、console、完成锁、刷新与390×844窄屏。负责人验收与 Codex 自动浏览器证据保持分层。
- 本轮文档收口只同步 `docs/V05_DEMO.md`、`docs/CURRENT_PROJECT_STATUS_2026-08-20.md`、`docs/DEVLOG.md`、`docs/review/V05_RC1_PR_DESCRIPTION_2026-08-24.md`；DEVLOG 仅追加，不再修改功能。tag、Release、artifact 与 `SHA256SUMS` 均未创建。

### A-DAY20-IMPLEMENT - 2026-08-26

- 单一玩家可见目标是把既有 V0.5 audit transcript 转成可读人生：新增独立 `js/v05-life-presentation.js`，保存提交前后快照、计算年龄/等级/货币/路线/武魂/魂环/魂骨变化，并生成年龄分组年表与25岁结构化结局；不修改 canonical、route graph、evidence、generator、archive 或 RNG/commit 语义。
- `v05-demo.html` 与 `js/v05-demo-app.js` 新增事件变化卡、静态年龄/跨岁年表组、结构化结局概览和窄屏样式；保留原始 JSON 审计摘要与既有 typed-stop。`js/v05-demo.js` 只在成功 commit 后追加呈现记录，reset 会清空记录。
- 新增 `test/v05-life-presentation.test.js`，扩展 `test/v05-demo.test.js`，并新增最小 Node 24 CI 候选；`package.json` 本地版本更新为 `0.5.0-rc.1`。CI workflow 尚未提交和运行，因此不是 CI passed。
- 定向测试 `13/13`、完整测试 `182/182`、RC generator `--check`、三个相关脚本 `node --check` 与 `git diff --check` 通过。
- Codex in-app Browser 本地 HTTP 验收：默认 seed 到25岁/42级、铜灵币29850、`100/100`、100条记录、结局可见、完成锁有效；reset 后年表0条。`v05-custom-1` 在17岁以 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 停于 `95/94`，年表保留94条已提交记录。390×844 无横向溢出，console warning/error 为0。
- 该浏览器结果只属于 Codex 对本地 checkout 的自动证据，不替代 Day19 项目负责人公开验收、Pages、CI 或 review。应用请求为200/304；仅非功能性 favicon 请求为404。
- 本轮保持所有变更 unstaged；未 commit、push、修改/创建 PR、merge、操作 Pages、tag、Release、artifact 或 `SHA256SUMS`。PR #4、V3、临时 Demo、APK Route Demo、`douluo2`、25岁后内容、`official-beast.element`、其他 unresolved handler、save/load、owner 材料和 archive 均排除。

### A-DAY20-DELIVER / A-DAY20-MERGE-PAGES-VERIFY / A-DAY20-RC1-CLOSEOUT-RELEASE - 2026-08-27

- Day20 玩家呈现层以精确13路径提交 `7d1e48566366a37dfc7696f97a919c0cefe4ada7` 普通 push 到 `codex/day20-player-presentation`，非 Draft PR [#8](https://github.com/MaxwellGuoDUT/douluo-life/pull/8) 仅包含该提交；PR Node 24 CI run [33056544343](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33056544343) 成功。
- PR #8 以 merge commit `35f7c2f20359f07fdb2513517dd262f61b102cb5` 合并到 `main`；main push CI run [33057309608](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33057309608) 成功。远端 feature branch 保留，PR #4 未修改。
- Pages run [33057308794](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33057308794) 与 deployment `6119825967` 成功，部署 `main@35f7c2f20359f07fdb2513517dd262f61b102cb5`，source 为 `main / (root)`；公开 HTML、app/presentation modules 与 production entry 均返回 HTTP 200。
- Codex 公开 Browser 可追溯覆盖新年表/变化卡、不自动跳底，并推进到8岁、cursor/history `40/40`；控制通道多次超时，未将25岁、custom seed、console、Network 或390×844升级为 Codex 公开自动证据。
- 项目负责人随后提供同一公开页面的默认 seed 人工终点验收：25岁/42级、铜灵币29850、`100/100`、第100项完整提交、24→25岁变化、铁角牛与4个魂环、结构化结局与边界声明均可见，完成锁有效，结构化错误为无。该记录与 Codex Browser、CI、Pages 和 HTTP 分开；它本身不覆盖 Network、console、390×844 或 custom seed。
- RC1 身份固定为 `v0.5.0-rc.1` GitHub prerelease，tag 目标是本次五文档 closeout 合并后的实时 `main` 准确 SHA。发布不包含自定义 Release asset/artifact，不生成或上传 `SHA256SUMS`；GitHub source archives 不冒充自定义资产。
- 本轮文档白名单仅为 `README.MD`、当前状态页、`docs/V05_DEMO.md`、本 DEVLOG 追加段和 RC1 review 记录。PR #4、V3、临时 Demo、APK Route Demo、`douluo2`、25岁后、`official-beast.element`、其他 unresolved handler、save/load、owner 材料与 archive 操作继续排除。
