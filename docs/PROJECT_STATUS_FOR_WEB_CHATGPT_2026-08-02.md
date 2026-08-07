# 斗罗人生模拟器：项目现状与今日任务规划输入

> **HISTORICAL SNAPSHOT**：本文记录 2026-08-02 Day12 完成前的现场状态，不是当前项目真相源。当前状态应以代码、测试、`docs/AI_CONTEXT.md`、`docs/DECISION_RECORD_V2.md` 和最新开发日志为准。

状态快照日期：2026-08-02  
项目：斗罗大陆魂师人生转盘模拟器  
当前分支：`codex/day10-v2-combat-foundation`  
当前提交：`1868288 docs: update day 10 and day 11 devlog`

## 1. 请先给出结论

这是一个使用 HTML、CSS、原生 JavaScript 和 JSON 数据的斗罗大陆人生模拟器。项目的长期方向已经从“逐年写事件”升级为“数据驱动的年度转盘会话 + 跨年剧情路线 + 斗罗履历状态”。

当前最准确的阶段判断是：

> V2 的核心数据模型、验证器和最小流程基础设施已经建立，并且基础测试全部通过；但是现有可运行入口仍然是 Player v1 + Game v1，V2 尚未接入主游戏流程，旧转盘内容也尚未完成正式迁移。因此项目现在处于“V1 可运行、V2 基础设施已成形、正在等待第一条 V2 端到端垂直切片”的过渡阶段。

不要把“66 项测试通过”理解为“完整游戏已完成”。测试主要覆盖数据结构、迁移、校验、路线状态、年度会话、战力计算和最小流程引擎。

## 2. 产品与设计原则

- 目标是模拟魂师从出生、武魂觉醒、学院成长、魂环/魂骨、宗门与路线，到封号斗罗、神考、神界或终局的人生。
- 游戏不是传统 RPG，不建立传统的 HP、力量、敏捷、智力、幸运四维玩法。
- 年度活动、剧情决定和结果都通过转盘随机产生，不提供传统 RPG 式的玩家选项按钮。
- 一年不是一次抽取，而是一次年度会话；同一年可以连续执行门槛、数量、目录、结果等多个转盘。
- 分支剧情可以保存路线节点，跨年继续推进。
- 内容应数据驱动；规则由模块执行；玩家状态由 Player 保存；界面只负责展示结果。
- 旧转盘表和自动推断出的路线只能作为参考资料，不能因为 WheelID 相邻或标题相似就自动生成正式剧情跳转。

## 3. 当前运行路径：仍然是 V1

现有浏览器入口在 `index.html`，由 `js/app.js` 启动：

```text
index.html
  -> js/app.js
  -> Game
  -> Player v1
  -> EventManager
  -> data/events/*.json
  -> UI 展示玩家状态、事件和历史
```

V1 目前可以：

- 开始新人生；
- 按年份推进；
- 根据玩家年龄、状态、历史标签和权重抽取事件；
- 应用基础 effects；
- 保存内存中的 history；
- 展示等级、境界、武魂、魂环、魂骨、学院、势力、身份、金钱和声望。

V1 当前的实际限制：

- `js/game.js` 和 `js/ui.js` 仍围绕 v1 字段工作；主入口尚未调用 Player v2、RouteState、AnnualSession 或 WheelFlowEngine。
- `continue` 按钮仍是禁用状态，设置按钮没有接入完整逻辑。
- `js/save.js` 为空，当前没有真正的存档/读档流程。
- `data/events/battle.json` 和 `data/events/ending.json` 为空；部分 `data/config` 与 `data/rules` 文件仍为空。
- 当前 UI 没有展示 V2 路线、年度会话、转盘记录或派生战力明细。

## 4. 已完成的 V2 基础设施

### Player State v2

相关文件：

- `js/player-v2.js`
- `js/player-state-migration.js`
- `js/player-selectors.js`
- `docs/PLAYER_STATE_V2.md`

已完成内容：

- `player/2.0` 基础结构；
- 多武魂实例、武魂定义 ID、进化族谱 ID 和激活武魂引用；
- 魂环归属到具体武魂；
- 七个魂骨部位；
- routeStates、annualFlags、spinHistory、history 等流程容器；
- v1 到 v2 的纯迁移适配器；
- 对未知旧字段、旧魂环、未知武魂和旧派生战力字段保留 warning，不静默丢失；
- v1/v2 兼容只读选择器；
- v2 结构校验和状态不变量保护。

明确规则：Player v2 不保存 `combatPower`、`staticCombatPower` 或 `effectiveCombatPower`。战力只能根据当前履历状态和版本化配置实时派生。

### Event Schema v2 与静态验证器

相关文件：

- `docs/EVENT_SCHEMA_V2_DRAFT.md`
- `js/event-schema-v2-validator.js`
- `data/v2/examples/wheels.minimal.json`
- `data/v2/examples/flows.minimal.json`
- `data/v2/examples/routes.minimal.json`

已经建立 wheel、item、flow、route、trigger、effects、advance 等 V2 结构，并验证：

- schemaVersion、kind、canonLevel、reviewStatus；
- wheel 与 item 的权重、启用状态和候选池；
- trigger 的作用域、路径和比较操作；
- effects 对年龄和派生战力字段的保护；
- flow 节点、跳转目标和引用关系；
- route 的 lane、互斥组和冲突策略；
- 不可达节点、无终止路径和无界循环；
- 已知但暂不支持的流程操作使用稳定错误码，而不是静默跳过。

### RouteState 与 AnnualSession

相关文件：

- `js/route-state.js`
- `js/annual-session.js`

已经建立：

- active、completed、failed、blocked 四个路线状态 bucket；
- 主线唯一性、互斥组和 `block` / `replace` / `branch` 冲突策略的基础检查；
- 路线进入、推进、完成、失败、阻塞的原子状态更新；
- 年度会话的状态、节点访问次数、spin 记录、年度上限和流程上限；
- 输入不变性和失败时不留下半提交状态。

### WheelFlowEngine 最小骨架

相关文件：

- `js/wheel-flow-engine.js`
- `docs/WHEEL_FLOW_MODEL.md`

当前真正可执行的是：

- `roll`；
- `end`；
- `same_year`；
- 基础 trigger、canon、enabled 和权重过滤；
- 确定性 RNG 注入、spin 记录和流程/年度上限；
- 对 v2 effects 的有限安全应用。

当前仍未在运行时完成的是：

- `gate`；
- `repeatWheel`；
- `dispatchWheel`；
- `setRoute`；
- `yieldYear`；
- `next_year`；
- `terminal`；
- 非空 `sessionContext` 的临时写入协议。

注意：验证器可以识别和检查部分未来操作，不等于 WheelFlowEngine 已经可以执行这些操作。

### 派生战力计算

相关文件：

- `js/combat-power.js`
- `data/config/combat-power.json`
- `docs/COMBAT_POWER_SYSTEM.md`

已经完成：

- 纯函数、配置驱动的战力计算模块；
- 等级连续曲线；
- 武魂品质、武魂真身、魂环年限、魂骨、血脉倍率和神级金色魂环的第一阶段计算；
- 99 级极限斗罗与 100 级海神唐三案例验证；
- `total`、`breakdown`、`warnings`、`rulesVersion` 等只读输出。

仍然是 `provisional` 或未完整实现的部分：

- 99 级累计额外 220 点突破奖励如何分配；
- 100 级特殊节点的完整平衡依据；
- 1-9 年魂环的正式合法处理；
- `soul_beast_cultivation` 和 `hybrid` 基础模式；
- 领域、属性、魂核、神位、神器、称号等模块的完整定义和数值；
- 完整神装套装奖励。

## 5. 旧数据与迁移资料

`data/reference/legacy-wheel/` 当前包含由旧表转换或推断出来的资料，例如：

- `legacy_rows.json`；
- `wheels.normalized.json`；
- `flows.inferred.json`；
- `routes.inferred.json`；
- `conversion_report.json`；
- `README.md`。

转换脚本是 `tools/convert_legacy_wheels.py`。

这些资料的定位是“只读参考和证据”，其中推断出的相邻关系、流程关系和路线关系尚未获得人工确认，不能直接当作正式运行数据。当前也没有批量重写 510 个旧转盘。

## 6. 当前工作区和 Git 状态

已确认的 Git 状态：

- 当前分支：`codex/day10-v2-combat-foundation`；
- 当前分支跟踪 `origin/codex/day10-v2-combat-foundation`；
- 最近一次提交：`1868288`；
- 最近的功能提交包括 Player v2、Event Schema v2 validator、RouteState、AnnualSession、WheelFlowEngine 和 v2 状态不变量修复；
- 当前没有进行暂存、提交、推送或 PR 操作。

未提交内容：

- 已修改：`docs/AI_CONTEXT.md`；
- 未跟踪：`CODEX_DAY11_PLAYER_V2_FLOW_FOUNDATION.md`；
- 未跟踪：`CODEX_NEXT_STAGE_V2_COMBAT.md`；
- 未跟踪：`docs/WHEEL_FLOW_MODEL.md`；
- 未跟踪：`data/reference/`；
- 未跟踪：`tools/`。

这些未跟踪文件可能包含负责人输入材料、参考转换产物或本阶段开发资料。不要直接执行 `git add .`，也不要删除或覆盖它们；应先确认哪些属于正式产品源码，哪些只应作为参考资料保留。

## 7. 当前验证证据

2026-08-02 在本地工作区使用 Node 的 `--test` 运行测试：

```text
66 tests
66 pass
0 fail
0 skipped
```

覆盖范围包括：

- AnnualSession 原子提交和限制；
- combat-power 计算与 99/100 级验收案例；
- Event Schema v2 静态验证；
- Player v1 -> v2 迁移；
- Player v2 校验与只读选择器；
- RouteState 冲突和状态迁移；
- WheelFlowEngine 最小 roll/end 流程；
- 现有 V1 new-game smoke test。

当前没有看到独立的 lint、build 或浏览器端自动化测试脚本。前端的真实点击体验、布局、继续游戏和存档流程仍需单独验证。

## 8. 需要网页端 ChatGPT 重点判断的问题

请优先判断以下问题，不要先扩写大量剧情：

1. 今天是否应先做一条最小 V2 端到端垂直切片，例如“加载一个 V2 wheel/flow -> 执行 roll -> 提交年度记录 -> UI 或调用层可观察结果”。
2. V1 与 V2 的兼容边界是否足够清晰，下一步是继续并行，还是可以安全切换某个独立入口。
3. WheelFlowEngine 的下一个最小能力应选 `gate`、`next_year`、`sessionContext`，还是路线接入；请按依赖关系排序，不要同时铺开所有操作。
4. 旧转盘参考数据在正式迁移前需要哪些人工确认、抽样规则和验收工具。
5. 战力系统哪些 provisional 数值必须先冻结，哪些可以暂时保留 warning，不要为了通过案例而写隐藏常数。
6. 前端、存档、战斗/终局事件和内容迁移的优先级如何安排，才能尽快形成可玩的闭环。

## 9. 给网页版 ChatGPT 的任务规划请求

请把上面的内容当作项目现场快照，先基于代码事实判断当前阶段，再制定“今天”的开发任务。请遵守以下输出要求：

1. 只给出今天真正能完成的 3-5 个任务，并按优先级排序。
2. 优先选择一个最小可验证的垂直切片，不要同时进行大规模旧转盘迁移、完整战斗系统、完整 UI 重写和全量数值平衡。
3. 每个任务写清：目标、涉及文件、实现边界、验收标准、需要运行的测试。
4. 明确区分“必须今天完成”“可以顺手完成”“暂不处理”。
5. 不要擅自删除 V1 兼容代码，不要把 inferred/provisional 内容升级为 confirmed。
6. 不要把文案中的“你选择”当作玩家主动选择，也不要根据 WheelID 顺序自动生成剧情跳转。
7. 不要使用 `git add .`，不要覆盖或删除未提交的负责人输入材料；如果建议提交，请给出精确的文件范围和提交边界，但不要直接执行 Git 操作。
8. 如果发现现状文档与代码存在冲突，以当前代码和测试结果为准，并明确列出冲突。
9. 最后给出一份简短的“今天完成后的项目状态”，用于下一次续接任务。
