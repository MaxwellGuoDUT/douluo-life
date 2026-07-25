# 开发日志

项目：斗罗人生模拟器  
记录范围：2026-07-19 至 2026-07-25  
当前阶段：文字人生模拟 MVP，已具备玩家、事件、历史记录、数值效果和条件触发系统。

## 项目总览

《斗罗人生模拟器》从静态网页起步，逐步演进为一个由 `Game` 统一调度、`Player` 保存状态、`EventManager` 提供事件、`UI` 负责渲染的前端文字模拟游戏。

当前已经完成：

- 基础页面与 GitHub Pages 部署。
- 玩家数据模型 `Player`。
- 游戏管理器 `Game`。
- 事件系统 `EventManager`。
- 事件数据规范 `Event Schema v1.0`。
- 出生事件数据化。
- 玩家人生历史 `history`。
- Effects System v1.0，事件可以修改玩家数值。
- Trigger System v1.0，事件可以根据年龄、属性和历史动态触发。
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

## 阶段总结

前 6 天的开发可以概括为四次升级：

1. 从静态页面到可运行 MVP。
2. 从玩家对象到人生推进流程。
3. 从写死事件到数据驱动事件系统。
4. 从固定年龄触发到条件驱动触发系统。

当前项目最重要的设计方向已经明确：用统一的数据规范描述事件，用 `Game` 执行规则，用 `Player` 保存状态，用 `UI` 展示结果。接下来应优先完善触发条件、事件库、存档和更丰富的玩家属性系统。
