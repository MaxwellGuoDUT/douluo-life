# CODEX DAY 12：V2 年度流程端到端垂直切片

> **HISTORICAL TASK RECORD**：本文是已完成的 Day 12 任务书，仅用于保存任务范围、验收要求与决策历史，不是当前开发指令。

## 一、任务背景

项目：斗罗大陆魂师人生转盘模拟器

当前分支：

`codex/day10-v2-combat-foundation`

当前阶段：

项目处于“V1 可运行、V2 基础设施已完成、尚未接入主流程”的过渡阶段。

目前已经存在：

* Player State v2；
* Player v1 到 v2 的迁移适配器；
* Player v1/v2 兼容选择器；
* Event Schema v2 静态验证器；
* RouteState；
* AnnualSession；
* WheelFlowEngine 最小骨架；
* 派生战力计算器；
* minimal wheel、flow 和 route 示例数据；
* 66 项通过的 Node 测试。

当前浏览器主入口仍然运行：

`Player v1 + Game v1 + EventManager`

V2 尚未形成完整、可观察、可连续推进的年度闭环。

本任务的核心目标不是继续增加孤立模块，而是完成第一条 V2 端到端垂直切片：

```text
Player v2
  -> 创建年度会话
  -> 加载 V2 wheel 和 flow
  -> 执行转盘
  -> 应用安全 effects
  -> 提交 spin 和年度记录
  -> next_year 推进年龄
  -> 浏览器页面展示结果
```

---

# 二、总体工作方式

请自主完成本任务，不要在每一个小步骤后等待负责人继续输入。

执行顺序：

1. 检查仓库当前代码和测试结构；
2. 确认本文档描述与代码是否一致；
3. 制定内部实现计划；
4. 实现代码；
5. 补充和运行测试；
6. 根据测试结果自行修复；
7. 完成浏览器开发入口；
8. 给出最终工作报告。

除非发现会导致数据丢失、需要删除大量现有代码、需要改变核心架构，或者当前代码与本任务存在根本冲突，否则不要中途停下来询问。

如发现文档和代码冲突，以当前代码和测试为准，并在最终报告中列出冲突。

---

# 三、严格限制

## 3.1 不得破坏 V1

不得删除、重写或替换以下现有运行路径：

* `index.html`
* `js/app.js`
* `js/game.js`
* Player v1
* EventManager
* V1 事件加载流程
* V1 UI

现有 `index.html` 必须继续能够运行 V1。

本次 V2 功能应通过独立入口运行，不得直接将默认主入口切换到 V2。

## 3.2 不得扩大任务范围

本次不要实现：

* 完整战斗系统；
* 战斗 UI；
* 完整存档或读档；
* V1 存档迁移；
* 完整 `gate`；
* `repeatWheel`；
* `dispatchWheel`；
* `setRoute`；
* RouteState 正式接入年度流程；
* `yieldYear`；
* `terminal`；
* 大规模旧转盘迁移；
* 自动确认 inferred 路线；
* 正式数值平衡；
* 完整转盘动画；
* 完整 UI 重写；
* battle 或 ending 内容扩写。

## 3.3 数据规则

必须继续遵守：

* Player v2 不保存派生战力；
* effects 不得直接修改年龄；
* effects 不得写入 `combatPower`、`staticCombatPower` 或 `effectiveCombatPower`；
* 战力只能通过 `combat-power.js` 实时计算；
* inferred 内容不能升级为 confirmed；
* provisional 数值不能伪装成正式定稿；
* 不得根据 WheelID 相邻关系自动生成流程跳转；
* 不得把文案中的“你选择”解释为传统 RPG 主动按钮；
* 玩家结果仍应由转盘流程产生。

## 3.4 工作区保护

当前工作区存在未提交材料，包括但不限于：

* `docs/AI_CONTEXT.md`
* `CODEX_DAY11_PLAYER_V2_FLOW_FOUNDATION.md`
* `CODEX_NEXT_STAGE_V2_COMBAT.md`
* `docs/WHEEL_FLOW_MODEL.md`
* `data/reference/`
* `tools/`

不要删除、覆盖、移动或批量格式化这些文件。

不得执行：

```bash
git add .
git add -A
git clean
git reset --hard
git checkout .
```

本任务不要执行 commit、push、merge、rebase 或创建 PR。

最终只提供建议的精确暂存范围和提交信息，由负责人决定是否执行。

---

# 四、任务一：建立 V2 年度会话调用层

## 4.1 目标

新增一个独立的 V2 orchestration 层，把现有 Player v2、AnnualSession 和 WheelFlowEngine 串联起来。

建议新增：

```text
js/v2-session-runner.js
```

测试文件名称应遵循仓库现有命名方式，例如：

```text
tests/v2-session-runner.test.js
```

或者：

```text
tests/v2-session-runner.integration.test.js
```

请先检查现有测试目录和模块导出方式，再确定准确文件名。

## 4.2 职责边界

`V2SessionRunner` 应负责：

1. 接收 Player v2；
2. 接收 wheel、flow 和相关 V2 数据；
3. 接收可注入 RNG；
4. 创建 AnnualSession；
5. 调用 WheelFlowEngine；
6. 收集 flow 执行结果；
7. 原子提交 effects；
8. 原子提交 spinHistory；
9. 写入年度 history 或年度记录；
10. 返回适合测试和 UI 读取的结构化结果。

建议返回结构：

```js
{
  player,
  session,
  flowResult,
  spins,
  annualRecord,
  warnings
}
```

允许根据现有代码结构调整字段名称，但需要保持结果清晰、稳定和可测试。

## 4.3 原子性要求

必须保证：

* 执行成功时，effects、spin 和年度记录共同提交；
* 执行失败时，不留下半提交状态；
* 原始 Player 输入不能被意外污染；
* 不允许只更新年龄却没有年度记录；
* 不允许只写入 spinHistory 却没有完成年度提交；
* 同一结果不能被重复应用。

优先复用已有 AnnualSession 原子提交机制，不要复制出第二套彼此冲突的事务逻辑。

## 4.4 RNG 要求

必须支持确定性 RNG 注入。

测试中应能够使用固定 RNG，使以下内容稳定：

* 抽中的 wheel item；
* spin 顺序；
* flow 结果；
* 年度记录。

相同输入和相同 RNG 应得到相同输出。

不要在测试中依赖不可控的 `Math.random()`。

## 4.5 effects 要求

继续复用现有 V2 effects 安全机制。

必须验证：

* 合法 effects 可以应用；
* 年龄字段不能通过普通 effects 修改；
* 派生战力字段不能写入 Player；
* 未支持的 effect 不得静默忽略；
* 失败时返回稳定错误或 warning；
* Player v2 状态不变量继续成立。

---

# 五、任务二：实现 `next_year` 最小运行语义

## 5.1 目标

让 V2 年度流程可以明确结束当前年度，并将玩家年龄增加一次。

目前 `same_year` 已存在基础支持，但年度生命周期还没有完整闭合。

本次只实现最小 `next_year`，不要同时扩展其他 advance 操作。

## 5.2 职责划分

建议按照以下职责实现：

### WheelFlowEngine

* 识别 flow 中的 `next_year`；
* 不直接修改 Player 年龄；
* 返回结构化的年度推进意图；
* 停止当前 flow 的继续执行。

建议结果形态：

```js
{
  advance: {
    type: "next_year"
  }
}
```

或者包含：

```js
{
  advance: {
    type: "next_year",
    fromAge: 6,
    toAge: 7
  }
}
```

具体结构应与当前项目风格一致。

### AnnualSession

* 标记当前年度会话已完成；
* 保存本年度 spin 和节点记录；
* 维护年度限制和流程限制；
* 不直接启动下一年度。

### V2SessionRunner

* 在确认整个年度执行成功后，将年龄增加一次；
* 写入年度记录；
* 返回推进前后的年龄；
* 不自动开始下一年的新 flow。

下一年度应由调用层再次创建新的 AnnualSession。

## 5.3 明确语义

必须区分：

### `same_year`

* 保持当前年龄；
* 可以继续同一年度中的后续节点；
* 不结束年度。

### `end`

* 结束当前 flow；
* 不应默认增加年龄；
* 不应偷偷等价为 `next_year`。

### `next_year`

* 结束当前年度；
* 年龄只增加一次；
* 会话完成；
* 不自动执行下一年度 flow。

## 5.4 防重复提交

需要避免以下问题：

* 同一个年度结果被调用两次，年龄增加两次；
* 已完成会话再次提交；
* flow 返回 `next_year` 后又继续执行其他节点；
* 异常发生后年龄已经增加；
* 年度记录重复写入。

可通过 session 状态、提交标记或不可重复 commit 机制处理。

不要依赖 UI 按钮禁用作为唯一保护。

---

# 六、任务三：补充完整集成测试

## 6.1 测试目标

新增或扩展测试，覆盖一条完整 V2 年度流程：

```text
创建 Player v2
  -> 加载 minimal 数据
  -> 创建 AnnualSession
  -> 执行 roll
  -> 命中确定 item
  -> 应用 effects
  -> 记录 spin
  -> 执行 next_year
  -> 提交年度记录
  -> 年龄增加一次
```

## 6.2 必须覆盖的案例

至少包含以下测试。

### 正常流程

* minimal wheel 和 flow 可以加载；
* 确定性 RNG 命中预期 item；
* flow 从 roll 正常运行到结束；
* spin 记录包含必要的 wheel、item、flow 或 node 信息；
* effects 被应用一次；
* 年度记录被写入；
* `next_year` 后年龄增加一次；
* 返回结果可供 UI 使用。

### `same_year`

* `same_year` 不增加年龄；
* 同一年可继续执行允许的节点；
* 年度 spin 上限继续生效。

### 失败原子性

模拟以下任意一种失败：

* 非法 effect；
* 找不到 wheel；
* 找不到 item；
* 找不到目标节点；
* 超出流程限制；
* 超出年度限制；
* 状态校验失败。

失败后验证：

* Player 年龄不变；
* spinHistory 未写入半条记录；
* history 未写入半个年度；
* routeStates 不被破坏；
* 原始输入对象不被污染。

### 重复提交

* 已完成年度不能再次提交；
* 年龄不会增加两次；
* effects 不会执行两次；
* 年度 history 不会重复。

### 派生战力保护

* effects 不能写入派生战力字段；
* 战力通过计算器读取；
* Player 结果中不出现持久化的派生战力字段。

### 确定性

* 相同 Player、flow、wheel 和 RNG 得到相同结果；
* 测试不依赖真实随机数。

## 6.3 回归要求

所有现有测试必须继续通过。

运行仓库实际可用的测试命令。

如当前标准命令为：

```bash
node --test
```

则最终必须达到：

```text
0 fail
0 skipped
```

测试总数可以高于原来的 66 项。

如仓库中有针对单文件的命令，也应先运行相关测试，再运行全量测试。

不得通过删除、跳过或放宽原有断言来获得绿色结果。

---

# 七、任务四：新增独立 V2 浏览器开发入口

## 7.1 目标

新增一个最小的浏览器页面，让 V2 年度流程第一次可以在真实浏览器中观察和连续运行。

建议新增：

```text
v2-demo.html
js/app-v2-demo.js
```

如确有必要，可新增：

```text
js/ui-v2-demo.js
```

不要修改现有 V1 主入口的启动方式。

## 7.2 页面最小功能

页面只需要展示：

* 当前年龄；
* 当前等级或境界摘要；
* 当前激活武魂；
* 当前 flow ID；
* 当前或最近节点；
* 本次抽中的 wheel item；
* 本年度 spin 数量；
* 最近一条年度记录；
* 当前派生战力总值；
* 战力规则版本；
* warnings；
* 错误信息。

页面提供一个主要按钮，例如：

```text
开始 V2 人生
```

或者：

```text
推进 V2 年度
```

可以根据状态使用同一个按钮或两个简单按钮。

按钮触发随机流程，不得生成传统 RPG 式剧情选择按钮。

## 7.3 页面数据

优先使用现有：

* Player v2 工厂或默认状态；
* minimal wheel；
* minimal flow；
* 现有战力配置。

如 minimal 数据无法形成合理的 `next_year` 闭环，可以对 example 数据进行最小修改，或者新增一个专用 demo 数据文件。

新增 demo 数据时必须：

* 使用 Event Schema v2；
* 通过静态验证器；
* 不与 inferred legacy 数据混合；
* 明确标记为 example、minimal 或 demo；
* 不伪装成正式剧情内容。

## 7.4 连续年度

页面应允许连续执行至少三个年度。

每个年度执行后：

* 年龄正确推进；
* 年度记录增加；
* spinHistory 累积；
* 不发生重复提交；
* 新 AnnualSession 使用新的年度状态；
* 上一年度的节点访问计数不应污染新年度；
* Player 的长期履历状态可以保留。

## 7.5 错误处理

浏览器页面不能因为一次执行错误而彻底失效。

至少应：

* 捕获异常；
* 在页面显示错误；
* 在控制台保留可调试信息；
* 防止用户快速连续点击导致重复提交；
* 执行期间暂时禁用推进按钮；
* 执行完成后恢复按钮。

不要为了处理异步按钮而引入大型前端框架。

项目继续使用原生 HTML、CSS 和 JavaScript。

## 7.6 样式边界

只做开发验证所需的基础样式。

不要投入时间做：

* 正式转盘动画；
* 大型角色面板；
* 完整路线树；
* 战斗特效；
* 页面主题重构；
* 手机端完整适配。

保持页面简单、清楚、便于调试。

---

# 八、任务五：最小 `sessionContext` 兼容处理

此任务优先级低于前四项。

只有在前四项完成且全量测试通过后再处理。

## 8.1 目标

允许 AnnualSession 接收非空 `sessionContext`，并在当前年度流程中以只读方式使用和保留。

## 8.2 本次只做

* 创建会话时接受普通对象；
* 深度或足够安全地复制输入；
* 防止外部对象修改污染会话；
* 同一年节点间保留 context；
* 在年度结果中返回 context 摘要；
* 新年度默认创建新的 context。

## 8.3 本次不做

* 任意路径写入；
* `setContext`；
* 通用 increment；
* context effects；
* context 自动合并到 Player；
* 完整 gate 判断；
* 跨年度自动继承；
* route 临时状态写入。

如果现有 WheelFlowEngine 明确拒绝非空 `sessionContext`，可以调整为接受只读 context。

未支持的写入操作仍应返回稳定错误码，不得静默执行。

---

# 九、浏览器手工验证

完成代码和 Node 测试后，检查项目实际的静态服务器运行方式。

不要假定通过双击 HTML 一定可以加载 JSON 或 ES Module。

使用仓库现有开发服务器；如仓库没有，则可以使用简单静态服务器，例如项目已有的 Python 或 Node 方式，但不要新增重量级依赖。

手工验证：

1. 打开现有 `index.html`；
2. 确认 V1 可以开始新人生；
3. 至少推进一次 V1；
4. 确认控制台没有因本次修改新增的错误；
5. 打开 `v2-demo.html`；
6. 创建 V2 玩家；
7. 连续执行至少三个年度；
8. 检查年龄每年只增加一次；
9. 检查 wheel item 正常显示；
10. 检查 spinHistory 或年度记录持续增加；
11. 检查派生战力正常显示；
12. 检查 Player 中没有保存派生战力字段；
13. 检查刷新页面后能够重新开始；
14. 检查 V1 和 V2 入口互不污染。

如果当前环境无法实际启动浏览器，请完成可执行代码和自动测试，并在最终报告中明确说明浏览器手工验证尚未执行，不能声称已经通过。

---

# 十、代码质量要求

## 10.1 保持模块边界

* Player 保存持久化履历状态；
* AnnualSession 保存年度临时流程状态；
* WheelFlowEngine 执行流程；
* V2SessionRunner 负责编排和原子提交；
* combat-power 只负责派生计算；
* UI 只负责展示和触发；
* UI 不直接实现规则。

## 10.2 避免重复实现

在新增功能前，先检查已有模块。

不要重新创建：

* 第二套 Player 校验器；
* 第二套 effects 执行器；
* 第二套 spin 限制逻辑；
* 第二套战力计算；
* 第二套 route 状态模型。

如现有接口不足，应以最小方式扩展现有接口。

## 10.3 稳定错误

对尚未支持的操作继续使用稳定错误码或明确错误对象。

不要：

* 静默跳过；
* 自动猜测；
* 将未知操作当作 `end`；
* 在控制台打印后继续提交错误状态。

## 10.4 注释和文档

只为复杂边界增加必要注释。

如新增公开模块，请说明：

* 输入；
* 输出；
* 是否修改输入；
* 失败语义；
* 原子提交边界。

不要为了本任务批量改写全部文档。

如确有必要，可新增或小幅更新一份 V2 vertical slice 文档，但不得覆盖负责人现有未提交文档。

---

# 十一、执行检查顺序

建议按以下顺序工作：

## 阶段 A：仓库检查

* 查看 `git status`；
* 查看当前分支；
* 查看相关模块；
* 查看测试目录；
* 查看 package 配置；
* 查看模块使用 CommonJS 还是 ES Module；
* 查看 V2 example 数据；
* 查看当前 WheelFlowEngine 的返回结构；
* 查看 AnnualSession 的提交和状态模型。

不要修改不相关文件。

## 阶段 B：调用层

* 实现 V2SessionRunner；
* 为现有 `roll -> end` 编写集成测试；
* 保证现有测试通过。

## 阶段 C：年度推进

* 实现 `next_year`；
* 补充 same_year、失败和重复提交测试；
* 运行相关测试和全量测试。

## 阶段 D：浏览器入口

* 新增独立 demo；
* 使用真实 V2SessionRunner；
* 展示结果；
* 支持连续年度；
* 验证 V1 不受影响。

## 阶段 E：可选 context

* 仅在前面全部稳定后处理最小 sessionContext；
* 再次运行全量测试。

## 阶段 F：最终检查

* 查看 `git diff`；
* 查看 `git status`；
* 确认没有误改负责人文件；
* 确认没有新增持久化战力字段；
* 确认没有把 inferred/provisional 内容升级；
* 再次运行全量测试；
* 输出最终报告。

---

# 十二、完成定义

本任务只有在以下条件满足时才算完成：

* 存在独立 V2SessionRunner 或等价调用层；
* minimal V2 wheel/flow 可以通过调用层执行；
* 执行结果可以原子提交；
* `next_year` 有明确运行语义；
* 年龄只推进一次；
* spinHistory 和年度记录可观察；
* 失败不会留下半提交状态；
* 确定性 RNG 测试通过；
* 派生战力仍为只读计算结果；
* 存在独立的 V2 浏览器开发入口；
* V1 主入口没有被替换；
* Node 全量测试全部通过；
* 没有删除或覆盖负责人未提交资料；
* 没有执行 Git commit、push 或清理操作。

如果部分目标因当前架构无法安全完成，保留已经完成且通过测试的部分，并在报告中准确说明阻碍，不要伪造完成状态。

---

# 十三、最终输出格式

完成后请按以下格式报告。

## 1. 阶段结论

用一段话说明：

* V2 是否已经形成年度垂直切片；
* 是否可以连续推进年度；
* V1 是否仍然可运行；
* 浏览器验证是否实际执行。

## 2. 实际修改文件

按类别列出：

### 新增

* 文件路径：作用

### 修改

* 文件路径：修改内容

### 未修改但检查过

只列关键文件。

## 3. 核心实现

说明：

* V2SessionRunner 的职责；
* 年度提交边界；
* `same_year`、`end`、`next_year` 的实际语义；
* 重复提交保护；
* RNG 注入方式；
* UI 如何调用 V2。

## 4. 测试结果

列出实际执行的命令和真实结果，例如：

```text
node --test tests/xxx.test.js
结果：X pass，0 fail
```

```text
node --test
结果：X tests，X pass，0 fail，0 skipped
```

不得只写“测试通过”，必须给出数字。

## 5. 浏览器验证

逐项说明：

* V1 是否打开；
* V1 是否可推进；
* V2 demo 是否打开；
* 是否连续执行三个年度；
* 控制台是否有错误；
* 年龄、spin、history、战力是否正确。

未执行的项目必须明确写“未验证”。

## 6. 已知限制

列出仍未实现的内容，例如：

* gate；
* route；
* save/load；
* battle；
* terminal；
* legacy migration；
* 完整数值平衡。

## 7. 发现的文档与代码冲突

没有冲突则写：

`未发现会影响本任务的事实冲突。`

## 8. Git 状态

报告：

* 当前分支；
* 修改文件；
* 未跟踪文件；
* 是否执行 commit；
* 是否执行 push。

预期：

* 未执行 commit；
* 未执行 push。

## 9. 建议提交边界

不得使用 `git add .`。

给出准确文件列表，例如：

```bash
git add \
  js/v2-session-runner.js \
  js/wheel-flow-engine.js \
  js/annual-session.js \
  tests/实际测试文件.js \
  data/v2/examples/实际修改文件.json
```

浏览器入口建议独立提交：

```bash
git add \
  v2-demo.html \
  js/app-v2-demo.js \
  js/ui-v2-demo.js
```

只列实际存在且实际修改的文件。

建议提交信息：

```text
feat: add v2 annual session vertical slice
```

```text
feat: add isolated v2 browser demo
```

## 10. 下一阶段建议

只给出 1 至 3 项，按依赖排序。

优先考虑：

1. 最小 gate；
2. sessionContext 写入协议；
3. RouteState 接入；
4. V2 存档格式。

不要建议立即开始全量旧数据迁移或完整战斗系统。
