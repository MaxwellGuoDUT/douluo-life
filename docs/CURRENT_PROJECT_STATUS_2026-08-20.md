# douluo-life 当前项目状态基线

状态：`Day19 RC1 archive 2R implemented / focused 83 passed / full 175 passed / current-checkout browser RC passed / Git delivery not authorized`

基线日期：2026-08-25（Asia/Shanghai；文件名保留历史日期）

适用仓库：`D:\0CODE\douluo-life`

配套任务书：`docs/tasks/DAY17_PROJECT_REBASELINE_TASK.md`

## 一、文档用途与权威边界

本文是截至 2026-08-20 的唯一项目现状入口，用于回答：

1. 当前公开版本、远端 PR、本地工作树分别处于什么状态；
2. 哪些能力属于正式 production、provisional Demo 或 APK 实验预览；
3. 项目现在位于哪个 Day 节点；
4. 负责人已经确认的产品方向和仍待实施审计的问题；
5. 进入 V0.5 实现前，允许和禁止执行什么。

本文不是新的玩法规则来源，也不会覆盖负责人工作簿、源文档、正式规则目录或历史任务书。本文记录的是“当前状态”，不是对所有历史材料的重新授权。

当状态冲突时，判断顺序为：

```text
负责人最新明确决定
→ 当前仓库和远端可核验事实
→ confirmed 规则、版本化配置与测试
→ 本文当前状态基线
→ DEVLOG 历史记录和旧交接文件
→ provisional / inferred / reference 材料
```

任何 Git、PR、Pages、Ready、merge、tag、Release 或 production 语义扩展仍需要单独授权；`A-RESET-DOC`、`A-RESET-DOC-SYNC` 和 `A-DAY18-TASK` 均不构成这些授权。

## Day19 RC1 覆盖说明（2026-08-24）

- 负责人选择 PR 方案 B：从 `main@c7d2978` 建立 focused RC 分支，不继续扩大 PR #4。
- 独立工作树为 `D:\0CODE\douluo-life-v05-rc1`，分支 `codex/v05-rc1`；原混合工作树不作为本轮写入目标。
- RC package 入口迁移到 `data/v05-rc/production-entry.json`，只列出 `douluo1` shard 与四类 runtime evidence；`douluo2`、monolith 和大目录不在 focused runtime package 中。
- archive 已由方案 2 调整为 2R。manifest 保留三个 `originalPath` 并新增对应 `archivePath`；e17ec72 原字节实体位于 `data/v2/archive/apk-replaced-2026-08-16/` 子目录，三个活跃路径恢复 `main@c7d2978` 状态。`archivedAt=2026-08-16` 和 replacement `reason` 语义不变，归档实体不属于 runtime 请求面。
- 2026-08-25 已对当前 focused checkout 完成新鲜 HTTP 浏览器 RC：默认 seed 逐岁到25岁、Network 请求闭包、console、完成锁、刷新和390×844窄屏均通过。该结果是当前 checkout 的本地浏览器证据，不是 Pages、CI、review、Ready 或 merge 证据。
- 本轮授权仅覆盖 47 个文件路径；没有 stage、commit、push、PR 创建/编辑、Ready、merge、tag、Release 或 Pages 操作。
- 方案 2 的历史验证为 focused 83/83、完整 155/175；20 项旧 V2 失败促成 2R 调整。2R 重新验证为 focused 83/83、完整 175/175，generator write/check 均通过；路径映射在保留原字节的同时恢复了活跃 V2 基线兼容性。
- 当前 focused browser RC 的全部响应为 HTTP 200、`loadingFailed=0`；未请求 monolith、`douluo2`、`options.json`、archive manifest 或 archive 实体。终点为25岁/42级、铜灵币29850、cursor/history `100/100`，完成按钮锁与刷新重置均通过，console error/warning 为0。

## 二、执行摘要

项目没有技术性失控，但已经发生项目管理偏航：

- Day 1～Day 16 有明确目标和交付边界；Day16 后没有正式 Day17 任务书，开发却继续进入 APK canonical runtime、路线执行器、战力适配、分片、懒加载和发布准备。
- 技术工作总体保持了来源追溯、typed unresolved、原子回滚和自动化验证；它不是无效工作。
- 产品目标从“每阶段交付一段玩家可见的完整人生”偏移为“扩大 APK 来源覆盖和技术闭合”。
- 当前不存在一条正式 production 的完整人生；最稳定的旧 production 玩家内容仍是 6 岁武魂觉醒，并在 7 岁内容边界停止。
- V3 可以演示较长人生，但整体是 provisional；现有 APK Route Demo 可以推进较远，但尚未收束成 V0.5 的明确可玩终点。
- 负责人已选择方案 B：APK canonical 资产、规则和路线成为 V0.5 正式产品主线；V1、V2、V3、临时 Demo、旧规则和 owner 材料全部保留，不覆盖、不删除，作为备用与对照资产。
- V0.5 唯一正式范围为 `douluo1`，目标终点为 25 岁；`douluo2` 与 25 岁后路线不阻塞 V0.5。
- 项目当前准确节点是：`Day18 V0.5 implemented / automated verification passed / browser RC passed / Git delivery pending`。

## 三、四层状态快照

| 层面 | 当前状态 | 可以宣称 | 不可宣称 |
|---|---|---|---|
| 公开 Pages | `main@c7d2978`，V1 `v0.0.1 Alpha` | 公开 V1 页面可用 | 本地 Preview RC 已部署 |
| 远端 PR #4 | open Draft，`head=cd47941`，5 commits，125 files | Day15、Day16 与 APK runtime 已进入 Draft 审阅分支 | 已 Ready、已合并或已通过完整 CI |
| 本地工作树 | 分支与远端 head 同步；A-FILE/A-FILE-RC 与 V0.5 文件仍未提交 | 本地 255 项测试通过，V0.5 自动化与分片 RC 存在 | 这些本地修改已进入 PR 或 Pages |
| 产品路线 | 方案 B 已确认；V0.5 本地独立入口与25岁完成锁已实现，旧入口完整保留 | `douluo1` 默认 seed 已通过自动化和真实浏览器0～25岁验收 | 已进入 Git/PR、已发布或旧入口已被替换 |

## 四、玩家可见产品面

### 4.1 V1 默认入口

- 当前公开 Pages 默认入口。
- 提供早期年度事件玩法。
- 仍显示 `v0.0.1 Alpha`。
- 没有被 V2、V3 或 APK Route Demo 替代。

状态：`public / legacy active`。

### 4.2 V2 Production Playtest

- Player v2、年度会话、WheelFlowEngine 和原子年度提交已经建立。
- 6 岁 production 武魂觉醒可以完整执行。
- Day15 扩展为 1～4 武魂、一次共享品质、固定形态权重和 271 项正式目录。
- 成功后推进到 7 岁，并诚实返回当前内容边界。
- 0～5 岁、7 岁以后、存档、战斗和 ending 尚未形成连续 production 内容。

状态：`production vertical slice / age 6 only`。

### 4.3 V3 最简人生 Demo

- 可演示 0 岁身份、6 岁觉醒、年度成长、魂环/魂骨和 100 级终局。
- 天赋运行时是独立实现；V3 编排及多个过场规则仍是 provisional。
- 91 级后 `+1/年`、5% 魂骨、固定 1500 战力对手和旧轮盘魂环等不得升级为正式规则。

状态：`playable provisional demo / not production`。

### 4.4 APK Route Demo

- 使用 APK canonical package、route graph、typed runtime 和来源证据。
- `douluo1` 固定 seed 已验证第 84 项成功提交，并在第 219 项明确停在 `official-beast.element` unresolved boundary。
- `douluo2` 只验证入口 shard 和第一步 typed boundary，不能宣称路线可推进。
- 当前本地 RC 使用 compact monolith、`douluo1`/`douluo2` shards 和按 pack 懒加载。

状态：`experimental typed-boundary preview / not complete route`。

### 4.5 V0.5 0～25 岁 Demo

- 新增独立入口 `v05-demo.html`，只声明 `douluo1` 与 0～25 岁范围。
- 默认 `apk-route-demo-seed` 在第 100 项完整提交后首次得到精确25岁、42级、cursor/history=100。
- V0.5 控制层在提交后检查年龄；进入 completed 后不会预抽第101项，也不会增加 RNG 或 history。
- 单步推进、按年龄连续推进、取消、重置、typed boundary 和实验 seed 已有自动化覆盖。
- 自定义 `v05-custom-1` 在17岁第95次 draw 命中 `beast.element.unresolved`，history 保持94，证明失败项未提交。
- Codex in-app Browser 已从新鲜 HTTP 页面完成默认 seed 0～25岁、Network、console、完成锁、刷新、390×844窄屏和旧入口回归。
- 浏览器终点为25岁/42级、铜灵币29850、cursor/history `100/100`；完成后重复触发没有消费额外状态。

状态：`local playable implementation / automated-verified / browser-verified / not staged`。

## 五、已经完成的稳定基础

以下能力已有配置、运行时或测试证据，但仍应按各自适用范围理解：

- Player v2 状态与 v1 迁移；
- Event Schema v2 和受保护派生字段；
- 年度 session、同年/跨年推进和原子提交；
- 6 岁 production 武魂觉醒；
- 271 项正式武魂目录和 `awakening-probabilities/1.2`；
- 0 级 `civilian_observer` 非战斗边界；
- 独立战力规则目录和即时派生战力；
- 独立天赋规则与运行时；
- route lane 基础设施；
- APK provenance、canonical package、route graph、runtime evidence；
- APK handler operation registry、typed unresolved 和原子回滚；
- compact route shards、pack lazy loading 和 fixed-seed 回归。

这些能力不能合并简称为“完整人生已完成”。

## 六、尚未完成的产品目标

当前没有完成：

- production 0～18 岁连续人生；
- production 0～25 岁完整主线；
- 正式学院、年度成长和成人势力路线；
- 完整战斗、死亡、结局和存档；
- 0 级平民旁观特别剧情；
- 91 级以上魂核成长、神考和神界终局；
- 魂兽/化形完整人生；
- `official-beast.element` 成功路径；
- `douluo2` 可推进路线；
- 一条经过自动化和真实浏览器完整验收的 production 人生。

## 七、本地 Git 状态

核验日期：2026-08-20。

- 当前分支：`codex/day14-release-closeout`
- HEAD：`cd479411a8e14d948f8ad2815dfdd1656e1ca9a3`
- upstream：`origin/codex/day14-release-closeout`
- ahead / behind：`0 / 0`
- `origin/main`：`c7d2978ea8a3e9063f99e31cdcb1b4cf448f1137`
- 暂存区：空
- tracked modified：17 个，其中 `index.html` 是明确排除的 owner/unrelated 修改
- A-FILE 任务范围：16 个 tracked 修改加 2 个新 route shard，共 18 个路径
- 工作树还包含 APK、`apk-analysis/`、任务书、Office 文件、archive、outputs 和 `.codex-tmp/` 等负责人材料

保护要求：

- 禁止 `git add .`、`git add -A` 或宽范围 glob；
- 禁止清理、删除、移动或自动纳入负责人材料；
- 未经新授权不得 stage、commit、push；
- `A-RESET-DOC` 只授权本文和 Day17 任务书的文件创建。

## 八、PR #4 与远端状态

PR：<https://github.com/MaxwellGuoDUT/douluo-life/pull/4>

- 状态：open Draft
- base：`main@c7d2978`
- head：`codex/day14-release-closeout@cd47941`
- commits：5
- changed files：125
- additions / deletions：5,013,418 / 521
- reviews：0
- review threads：0
- connector commit statuses：0
- connector PR workflow runs：0
- PR 页面显示 3 / 3 checks 标记；该页面信号不能替代可追溯的 PR workflow/CI 记录
- PR body 已于 2026-08-20 依据 `A-PR-EDIT` 同步
- PR 未 Ready、未 merge

PR #4 同时承载 Day15、Day16 和 APK runtime；它不是一个单一 Day 的小型交付单元。合并前必须先经过 Day17 的产品方向和 PR 处置决策。

## 九、Pages 与发布状态

- Pages source：`main / (root)`
- 最近核验的成功运行：`32360588072`
- 部署提交：`c7d2978ea8a3e9063f99e31cdcb1b4cf448f1137`
- 当前公开站点仍是 main 上的 V1 版本
- Draft 分支 push 不直接改变 Pages
- merge 到 main 会自动触发公开 Pages 部署
- 当前没有正式 Preview tag、GitHub Release、Release artifact 或 `SHA256SUMS`

## 十、验证状态

2026-08-20 重新执行：

```text
npm.cmd test
255 passed
0 failed
0 cancelled
0 skipped
```

精确 A-FILE tracked 路径的 `git diff --check` 通过。以上是本地自动化证据，不是 GitHub CI、PR review 或生产 Pages 验收。

已有浏览器证据包括：

- V0.5 默认 seed 从0岁逐岁到25岁，终点42级、铜灵币29850、cursor/history `100/100`；
- V0.5 首屏及启动后的 Network 全部 HTTP 200，未请求 monolith、`douluo2`、`options.json` 或 archive manifest；
- V0.5 完成锁、刷新重置、390×844窄屏单步和 console 无 error/warning；
- V1、V2、V3、临时魂环 Demo 与 APK Route Demo 均可打开且 console 无 error/warning；
- V2 6 岁觉醒与 7 岁内容边界的负责人验收；
- APK fixed seed 第 84 项成功与第 219 项 typed boundary；
- 本地 route shard Network RC；
- `douluo2` 入口第一步 smoke。

浏览器证据必须继续与自动化字段断言分别记录。

## 十一、当前检测到的治理与技术风险

### 11.1 Day 结构中断

Day16 后没有正式 Day17 任务书，但产生了大规模 APK runtime 和发布工程。当前分支名仍为 `day14-release-closeout`，已经不能表达实际工作范围。

### 11.2 产品方向冲突已决策，文档与运行边界待收口

`docs/tasks/NEXT_STAGE_APK_REFERENCE_INTEGRATION_WORK_OBJECTIVE_2026-08-16.md` 仍是 `draft / awaiting owner approval`，并把 APK 定义为参考资产。

当前 `data/production-entry.json` 却声明：

```json
{
  "status": "active",
  "source": "apk-canonical"
}
```

负责人已于 2026-08-20 选择方案 B，确认 APK canonical 成为 V0.5 正式产品主线。因此 `active / apk-canonical` 现在具有明确产品方向依据。

旧目标草案继续作为历史材料保留，不覆盖、不删除；其 `APK reference-only` 路线已被本次负责人决定取代。本轮选择保留该历史文件原样，不把新方向覆盖写入旧草案；如需增加 `superseded` 标记，应另行给出该文件的精确授权。V0.5 仍必须区分 source-confirmed、implemented、automated-verified、browser-verified 和 unresolved，不因主线确认而自动闭合未接语义。

### 11.3 远端 archive manifest 悬空引用

PR head 的 `data/production-entry.json` 引用：

```text
data/v2/archive/apk-replaced-2026-08-16/manifest.json
```

该文件本地存在于未跟踪 archive，但没有进入 PR head，远端路径返回 404。当前测试没有阻止这一引用漂移。此项是 PR Ready/merge 前必须处置的明确阻塞项，但处置方式尚未授权。

### 11.4 PR 规模与审阅风险

PR #4 的 125 个文件和约 501 万 additions 混合了正式 production、provisional Demo、APK 数据、运行时、测试和文档，超出单一 Day 的合理审阅单位。

### 11.5 状态文档漂移

- README 仍描述较早的 V2 阶段；
- Day16 交接是阶段中途快照，后续实现已超过它；
- 本地 PR body 草案仍写“待同步”，远端已经同步；
- DEVLOG 是最完整记录，但过长，不适合作为唯一当前状态入口。

本文建立后，旧文档继续保留历史价值，但不得单独用来回答“项目现在到哪一步”。

## 十二、当前 Stop / Go

### GO

- 只读审计和状态核验；
- 在 `A-FILE-V05` 精确范围内维护已实现的 V0.5 文件；
- 同步已完成的 `A-BROWSER-V05-RC` 证据，并准备精确 Git 交付范围；
- 分类现有资产和 PR 范围，但保持旧资产原位；
- 制定 README、状态页与 PR 范围的后续同步方案；
- 保留 typed unresolved 和所有 owner materials；
- 为 `douluo1` 0～25 岁独立 V0.5 入口准备精确实现文件清单。

### STOP

- 在没有新文件授权前扩大 V0.5 已确认的7文件范围；
- 实现 V0.5 默认 0～25 岁路径不需要的 APK handler；
- 为赶进度猜测、近似或静默补全 APK 规则；
- 实现 25 岁后 `official-beast.element` 成功路径；
- 把 `douluo2` 描述为可推进路线；
- 把 V3 provisional 规则升级为 production；
- stage、commit、push 当前工作树；
- 将 PR #4 转 Ready 或 merge；
- 创建 tag、Release 或发布 artifact；
- 用 255 tests 代替产品阶段完成判断。

## 十三、负责人已确认的产品方向

2026-08-20，负责人选择方案 B，并补充以下约束：

1. 以 APK 资产与规则为主，尽快完成一版可玩 Demo V0.5；
2. 项目管理恢复既有分 Day 模式；
3. V1、V2、V3、临时 Demo、旧规则目录、owner 文件、archive、outputs 和源材料全部保留；
4. 不为切换主线覆盖或删除既有资产；
5. V0.5 使用独立入口并复用 canonical 数据；
6. V0.5 唯一正式 pack 为 `douluo1`；
7. 25 岁是 V0.5 明确终点；
8. 25 岁后路线、`douluo2` 和 `official-beast.element` 不阻塞 V0.5；
9. 默认固定 seed 必须从起点稳定到达 25 岁；自定义 seed 可以保留实验状态并在未接逻辑处 typed stop；
10. 自动化、浏览器、CI、Pages 和发布状态继续分别记录。

PR #4 继续保持 Draft，作为当前 APK 主线集成基线；是否拆分、追加 V0.5、Ready 或 merge 均等待独立审计和授权。

## 十四、下一节点

当前节点仍是 `Day18 APK V0.5 0～25 岁可玩 Demo`，见：

`docs/tasks/DAY18_APK_V05_PLAYABLE_DEMO_TASK.md`

`A-DAY18-AUDIT`、`A-FILE-V05`、`A-BROWSER-V05-RC` 与浏览器日志同步均已完成：V0.5 已具备本地自动化和真实浏览器证据。下一步不是继续扩大玩法，而是先核对混合工作树、compact shard/generator 前置资产与 V0.5 新文件的精确 Git 交付范围；在独立授权前不得 stage、commit、push、修改 PR、Ready、merge 或描述为 Pages 已发布。
