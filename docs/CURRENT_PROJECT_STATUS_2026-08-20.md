# douluo-life 当前项目状态基线

状态：`Day20 local implementation candidate / player-readable timeline and ending / automated and Codex local browser verified / unstaged / remote delivery unchanged`

基线日期：2026-08-26（Asia/Shanghai；文件名保留历史日期）

适用工作树：`D:\0CODE\douluo-life-v05-rc1`（原 `D:\0CODE\douluo-life` 混合工作树保持独立）

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
- 已按独立授权完成精确 47 路径 stage、commit 与普通 push；提交为 `e98bf8a`，本地与 `origin/codex/v05-rc1` 一致。Draft PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5) 已创建，未转 Ready、未 merge，未操作 Pages、tag 或 Release。
- 方案 2 的历史验证为 focused 83/83、完整 155/175；20 项旧 V2 失败促成 2R 调整。2R 重新验证为 focused 83/83、完整 175/175，generator write/check 均通过；路径映射在保留原字节的同时恢复了活跃 V2 基线兼容性。
- 当前 focused browser RC 的全部响应为 HTTP 200、`loadingFailed=0`；未请求 monolith、`douluo2`、`options.json`、archive manifest 或 archive 实体。终点为25岁/42级、铜灵币29850、cursor/history `100/100`，完成按钮锁与刷新重置均通过，console error/warning 为0。
- Ready 前审计重新执行 generator check、focused 83/83、full 175/175 与提交级 whitespace check，全部通过。PR #5 为 `CLEAN / MERGEABLE`；CI 为 `unavailable / not configured`，review 为 `unavailable`。Pages 仍发布 `main@c7d2978`。
- focused checkout 只包含 V1、V2 与 V0.5 HTML 入口；V3、临时魂环 Demo 和 APK Route Demo 留在 PR #4/原混合工作树，属于 focused 拓扑排除，不作为 PR #5 当前 checkout 的浏览器通过项。

## 二、执行摘要

项目没有技术性失控，但已经发生项目管理偏航：

- Day 1～Day 16 有明确目标和交付边界；Day16 后没有正式 Day17 任务书，开发却继续进入 APK canonical runtime、路线执行器、战力适配、分片、懒加载和发布准备。
- 技术工作总体保持了来源追溯、typed unresolved、原子回滚和自动化验证；它不是无效工作。
- 产品目标从“每阶段交付一段玩家可见的完整人生”偏移为“扩大 APK 来源覆盖和技术闭合”。
- 当前不存在一条正式 production 的完整人生；最稳定的旧 production 玩家内容仍是 6 岁武魂觉醒，并在 7 岁内容边界停止。
- V3 可以演示较长人生，但整体是 provisional；现有 APK Route Demo 可以推进较远，但尚未收束成 V0.5 的明确可玩终点。
- 负责人已选择方案 B：APK canonical 资产、规则和路线成为 V0.5 正式产品主线；V1、V2、V3、临时 Demo、旧规则和 owner 材料全部保留，不覆盖、不删除，作为备用与对照资产。
- V0.5 唯一正式范围为 `douluo1`，目标终点为 25 岁；`douluo2` 与 25 岁后路线不阻塞 V0.5。
- 项目当前准确节点是：`Day19 V0.5 RC1 committed and pushed / Draft PR #5 / Ready pre-audit Conditional Go`。

## 三、四层状态快照

| 层面 | 当前状态 | 可以宣称 | 不可宣称 |
|---|---|---|---|
| 公开 Pages | `main@c7d2978`，V1 `v0.0.1 Alpha` | 公开 V1 页面可用 | 本地 Preview RC 已部署 |
| 远端 PR #4 | open Draft，`head=cd47941`，5 commits，125 files | Day15、Day16 与 APK runtime 已进入 Draft 审阅分支 | 已 Ready、已合并或已通过完整 CI |
| 远端 PR #5 | open Draft，`main@c7d2978 ← codex/v05-rc1@e98bf8a`，1 commit、47 files | focused RC 已进入远端 Draft，`CLEAN / MERGEABLE` | CI/review 已通过、已 Ready 或已合并 |
| focused 工作树 | HEAD 与 upstream 同为 `e98bf8a`；功能提交后干净，当前仅有本轮四文档授权变更 | RC 功能已 commit/push，自动化和浏览器证据对应同一提交 | 当前文档变更已 stage/commit/push |
| 产品路线 | 方案 B 已确认；V0.5 独立入口与25岁完成锁已进入 PR #5；旧资产按拓扑保留 | `douluo1` 默认 seed 已通过自动化和真实浏览器0～25岁验收 | V0.5 已发布或 focused PR 包含 V3/临时/APK Route Demo |

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
- Codex in-app Browser 已在 focused checkout 从新鲜 HTTP 页面完成默认 seed 0～25岁、Network、console、完成锁、刷新与390×844窄屏；旧入口矩阵属于 Day18 原混合工作树历史证据，不扩展 focused PR #5 的文件拓扑。
- 浏览器终点为25岁/42级、铜灵币29850、cursor/history `100/100`；完成后重复触发没有消费额外状态。

状态：`focused RC implementation / automated-verified / browser-verified / committed / pushed / Draft PR #5 / not published`。

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

## 七、focused Git 状态

核验日期：2026-08-25。

- 当前分支：`codex/v05-rc1`
- HEAD / upstream：`e98bf8a9b9dfb91651a092f728388c835ac90ace`
- upstream：`origin/codex/v05-rc1`
- ahead / behind：`0 / 0`
- base：`main@c7d2978ea8a3e9063f99e31cdcb1b4cf448f1137`
- RC 提交范围：精确 47 路径、1 commit，无第48路径
- 功能提交后的 focused 工作树与暂存区均为空；本节同步后只允许出现本轮四文档差异
- 原 `D:\0CODE\douluo-life` 混合工作树及其中 owner 材料不属于本轮操作目标

保护要求：

- 禁止 `git add .`、`git add -A` 或宽范围 glob；
- 禁止清理、删除、移动或自动纳入负责人材料；
- 未经新授权不得 stage、commit、push 当前四文档变更；
- `A-RESET-DOC` 只授权本文和 Day17 任务书的文件创建。

## 八、PR 与远端状态

### 8.1 focused PR #5（当前 RC 候选）

PR：<https://github.com/MaxwellGuoDUT/douluo-life/pull/5>

- 状态：open Draft
- base / head：`main@c7d2978 ← codex/v05-rc1@e98bf8a`
- commits / changed files：`1 / 47`
- additions / deletions：`103201 / 1`
- merge：`CLEAN / MERGEABLE`
- checks：无该提交 Actions run；CI 为 `unavailable / not configured`，不是 passed
- reviews / comments / review requests：`0 / 0 / 0`，review 为 `unavailable`
- Ready、merge、Pages、tag 与 Release 均未执行，继续使用独立授权门

### 8.2 PR #4（历史集成分支快照）

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

PR #4 同时承载 Day15、Day16 和 APK runtime；它不是 focused V0.5 RC 的交付 PR。其本节数值是历史快照，PR #5 的 Ready 决策不得借用 PR #4 的 checks 或 browser 证据。

## 九、Pages 与发布状态

- Pages source：`main / (root)`
- 最近核验的成功运行：`32360588072`
- 部署提交：`c7d2978ea8a3e9063f99e31cdcb1b4cf448f1137`
- 当前公开站点仍是 main 上的 V1 版本
- Draft 分支 push 不直接改变 Pages
- merge 到 main 会自动触发公开 Pages 部署
- 当前没有正式 Preview tag、GitHub Release、Release artifact 或 `SHA256SUMS`

## 十、验证状态

2026-08-25 对 `e98bf8a` Ready 前重新执行：

```text
npm.cmd test
175 passed
0 failed
0 cancelled
0 skipped
```

RC generator `--check`、8 个 focused 测试文件 `83/83`、完整 `npm.cmd test` `175/175` 与 `main@c7d2978..e98bf8a` 提交级 whitespace check 均通过。以上是本地自动化证据，不是 GitHub CI、PR review 或生产 Pages 验收。

已有浏览器证据包括：

- V0.5 默认 seed 从0岁逐岁到25岁，终点42级、铜灵币29850、cursor/history `100/100`；
- V0.5 首屏及启动后的 Network 全部 HTTP 200，未请求 monolith、`douluo2`、`options.json` 或 archive manifest；
- V0.5 完成锁、刷新重置、390×844窄屏单步和 console 无 error/warning；
- Day18 原混合工作树曾验证 V1、V2、V3、临时魂环 Demo 与 APK Route Demo 均可打开；focused checkout 只包含 V1、V2 与 V0.5，其他入口属于拓扑排除；
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

### 11.3 focused archive manifest 已闭合

PR #4 历史 head 的 `data/production-entry.json` 曾引用：

```text
data/v2/archive/apk-replaced-2026-08-16/manifest.json
```

focused PR #5 已采用 archive option 2R：manifest 与三个 `archivePath` 实体均进入精确47路径提交，实体与 `e17ec72` 原字节一致，活跃路径保持 `main@c7d2978` 状态，V0.5 runtime 不请求 manifest 或实体。该历史悬空引用不再是 PR #5 的 Ready blocker。

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

PR #4 继续作为历史 APK 主线集成 Draft；focused V0.5 使用独立 Draft PR #5。PR #5 当前 Ready 前结论为 `Conditional Go`：代码候选通过，CI/review 如实记录为 unavailable，状态文档同步及其精确 Git 交付完成后才可进入独立 `A-READY`。

## 十四、下一节点

当前节点为 `Day19 V0.5 RC1 focused PR Ready 前收口`。`e98bf8a` 已 commit、普通 push 并创建 Draft PR #5；新鲜自动化与当前 checkout 浏览器 RC 均通过。CI 和 review 为 unavailable，Pages 仍为 `main@c7d2978`。

下一步仅处理本轮四文档差异的精确 stage、commit 与 push 授权；完成后重新核对 PR head，再由负责人单独决定是否执行 `A-READY`。Ready 不包含 merge 或 Pages 授权。

## 十五、Day19 RC1 合并与公开验收最终状态（2026-08-25）

第十四节是 Ready 前历史快照。后续独立授权已完成以下交付：

- PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5) 已转 Ready，并以 merge commit `67abd4785d5365c8c95816201ef4524688709b21` 合并到 `main`；Pages run [32752990658](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32752990658) 成功。
- 公开验收暴露“每次推进后页面跳到 history 底部”的交互问题。hotfix 仅移除页面级 `scrollIntoView` 并增加防页面跳底回归测试，没有改变游戏规则、数据或运行时请求边界；focused `7/7`、完整 `176/176` 通过。
- hotfix commit `981af0f74142c956a4605a40a19d5b690fc3cb43` 经 PR [#6](https://github.com/MaxwellGuoDUT/douluo-life/pull/6) 以 merge commit `10d33a2bb0f3399df7a18c139848f4330a41ec35` 合并；Pages run [32755367252](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32755367252) 成功。
- Codex 的 hotfix 后公开自动浏览器证据确认开始流程、限定资源请求、console 0、页面不再自动跳底，并推进至21岁；25岁、完成锁、刷新与390×844窄屏未由该次自动调用闭合，原因是最终批次工具超时。
- 项目负责人已在公开 [`v05-demo.html`](https://maxwellguodut.github.io/douluo-life/v05-demo.html) 完成人工验收，明确确认不再自动跳底，并通过0～25岁、Network、console、完成锁、刷新与390×844窄屏。该负责人验收是最终公开验收依据，不冒充 Codex 自动浏览器结果。

当前结论为 `V0.5 RC1 merged / Pages success / owner public acceptance passed`。功能工作已停止扩展；未创建 tag、GitHub Release、artifact 或 `SHA256SUMS`，这些仍不是本次收口的一部分。

## 十六、Day20 玩家可见呈现层本地候选（2026-08-26）

Day19 的合并、Pages 与负责人公开验收仍是既有远端证据；本节只记录 `A-DAY20-IMPLEMENT` 在 focused 工作树中的本地实现，不把本地结果冒充新的 PR、CI、Pages 或负责人验收。

- 单一玩家可见目标：让既有 `douluo1` 0～25 岁路径从“运行时审计页”提升为可读人生记录。页面现在按 `0 岁`、`0 → 1 岁` 等年龄阶段分组保存每个成功提交事件，并为年龄、等级、铜灵币、路线、武魂、魂环和魂骨变化生成可读卡片；25 岁显示结构化结局概览、武魂/魂环与边界声明。
- 新呈现层只读取提交前后角色快照，不修改 canonical 数据、route graph、evidence、生成器、archive 或运行时规则。失败项、busy guard、取消和 typed boundary 均不追加半条人生记录。
- 自动化：新增呈现层单测与 runner/UI 回归；定向 `13/13`、完整 `182/182`、RC generator `--check`、三个脚本 `node --check` 与 `git diff --check` 均通过。
- Codex 本地 Browser：默认 seed 到达25岁/42级、铜灵币29850、`100/100`、100条记录，结构化结局可见且完成后按钮禁用；重置清空年表。`v05-custom-1` 在17岁以 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 停于 `95/94`，只保留94条已提交记录。390×844 下 document scroll width 为375、记录右边界小于 viewport，console warning/error 为0。
- 本地 HTTP 请求证据：入口及新增模块为200/304，随后只加载 `douluo1` route graph 与既有四类 runtime evidence；favicon 的非功能性404不属于应用模块失败。
- `package.json` 本地版本更新为 `0.5.0-rc.1`；新增最小 Node 24 `push(main)` / `pull_request` CI workflow，但它尚未提交或运行，因此 CI 状态为 `provisional / not run`，不是 passed。
- 本轮没有 stage、commit、push、PR、merge、Pages、tag、Release、artifact 或 `SHA256SUMS` 操作；公开 URL、Day19 owner acceptance 与远端交付状态没有被本地候选替代。

明确排除：PR #4、V3、临时魂环 Demo、APK Route Demo、`douluo2`、25岁后内容、`official-beast.element`、其他 unresolved handler、save/load、owner APK/DOCX/XLSX/outputs/task books/`.codex-tmp`，以及 archive 迁移或清理。
