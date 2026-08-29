# 斗罗人生 V0.5 Demo

状态：`V0.5 RC1 delivered / Day22 destiny-cohort RC2 local implementation complete / automated verified / Browser verified / unstaged`

日期：2026-08-29（Day22 本地实现候选）

对应任务：Day18 APK canonical `douluo1` 0～25 岁可玩 Demo

## 入口

本地静态服务器启动后打开：

```text
http://127.0.0.1:8080/v05-demo.html
```

也可以直接打开仓库中的 `v05-demo.html`。真实浏览器 RC 应优先使用 HTTP 页面，以便核对 Network、console 和刷新行为。

V0.5 使用独立入口，不替换 focused base 已有入口：

- `index.html`
- `v2-demo.html`

V3、Soul Ring Demo 和 APK Route Demo 仍留在历史 PR #4/原混合工作树的审阅范围；它们不为 focused RC PR 从 `main@c7d2978` 额外引入。当前 focused checkout 只包含 `index.html`、`v2-demo.html` 与 `v05-demo.html`；V3、Soul Ring Demo 与 APK Route Demo 属于已确认的 focused 拓扑排除，不得描述为本 checkout 已验证。

## 产品范围

V0.5 只声明：

- 内容包：`douluo1`
- 来源：活动 `apk-canonical` package
- 玩家范围：正式入口到精确 25 岁
- 默认 seed：`apk-route-demo-seed`
- 展示终点：25 岁完整 option transaction 成功提交之后

25 岁是 V0.5 的 presentation/release boundary，不是 APK graph 的原始 ending，也不代表完整人生、魂兽路线、91+、神考或神界已经完成。

## 默认路径锁定

自动化锁定的首次 25 岁提交为：

```text
item        100
flow        douluo1:flow.formal-source.c9944ade-310d-41eb-b8ea-01723cab952c
pool        c9944ade-310d-41eb-b8ea-01723cab952c
option      fff9f5
age         24 -> 25
level       41 -> 42
cursor      99 -> 100
history     99 -> 100
nextFlow    douluo1:flow.formal-special-growth
digest      967347b48f6680be71b1f33d18c52f392519afd4c7afb5255beae20a74531391
```

完成后页面控制层在任何下一次 draw 之前封锁单步和连续推进，所以 cursor、history、routeHistory 和 currentFlow 保持在第 100 项提交后的状态。

## 页面控制

- **开始新人生**：按输入 seed 加载 `douluo1` shard 与四类 runtime evidence，并从正式入口创建会话。
- **推进下一项**：执行一次 draw 和一次完整原子 commit。
- **推进至下一岁**：逐项调用同一个 runtime，在年龄改变、用户停止、typed boundary、错误、50 步安全上限或 25 岁时停止。
- **重置会话**：使用当前 seed 回到 0 岁入口；不提供 save/load。

上面四项是 RC1 历史控制说明。Day21 本地 RC2 候选已重构为：

- **开始新人生**：显式创建新 runner；已有存档时先确认，首次成功提交后才覆盖当前 V0.5 槽。
- **继续上次人生**：加载同一正式内容包，按 seed 重放到 checkpoint，并逐字段核对 cursor、history、flow、角色与摘要指纹。
- **转动一次 / 推进至下一岁**：仍只调用既有 runner 的一次 draw + 原子 commit；转盘动画只消费 runtime 返回的 spin snapshot，不调用额外 RNG。
- **清除本地存档**：只删除 `douluo-life:v05:checkpoint`，不调用 `localStorage.clear()`，也不修改当前内存会话。

## Day21 中央转盘、侧栏与恢复模型

- `js/v05-wheel-view.js` 直接调用 runtime 的 `selectApkPoolOptions`，保留 eligible option 的集合、顺序和原始 weight；每个正权重 option 独立成扇区，归一化角度闭合 360°。
- 静态 exact flow 可以只读解析；遇到 dynamic resolver/action 时返回 `dynamic` presentation boundary，页面明确说明由 runtime 在正式提交时解析，不猜 pool、option 或概率。
- runtime 完成 draw 后返回该次真实 eligible snapshot；UI 据此把指针动画落到实际 option。CSS 动画与 reduced-motion 降级均不读取或修改 RNG、cursor、history。
- “角色档案”是性别、年龄/等级、铜灵币、路线、武魂、魂环、魂骨和里程碑的唯一完整展示；“人生记事”保留全部年龄分组、变化标签和已提交事件。二者从同一 runner/presentation state 派生。
- 桌面 drawer 使用 fixed overlay，因此不会改变中央舞台宽度；390×844 下转为 bottom sheet。按钮有明确文字、`aria-expanded`/`aria-controls`、焦点样式、Escape 关闭与焦点返回。
- save schema v1 仅保存 seed、phase、提交数、cursor、flow、内容身份和摘要指纹；不序列化后直接信任 session。恢复总是创建全新 runner 并确定性重放。
- `ready` 重放成功提交数；`completed` 重放到第100项并恢复完成锁；`boundary` 先重放成功 history，再复现同一个失败 draw 和 typed error。坏 JSON、未知 schema、内容变化与重放不一致均拒绝且不自动删除。
- localStorage 写入发生在游戏 commit 之后；quota/security error 只产生 persistence warning，不回滚或破坏已提交游戏状态。busy、cancel 和普通失败不生成半条 checkpoint。

默认 seed 是正式验收路径。自定义 seed 标记为 experimental，不承诺 0～25 岁全路径闭合；命中未接逻辑时页面显示 typed boundary，并阻止重复消费失败项。

自动化使用 `v05-custom-1` 验证实验边界：第 95 次 draw、17 岁时命中 `beast.element.unresolved`，cursor 为 95、成功 history 为 94，失败项没有提交。

## 加载边界

首屏只调用 production loader 读取 RC 专用入口：

- `data/v05-rc/production-entry.json`
- `data/v05-rc/package-index.json`
- `data/v05-rc/package-policy.json`

开始人生后只指定 `routePackId=douluo1`，并加载：

- `route-graph.douluo1.json`
- `formal-special-result-runtime-evidence.json`
- `human-soul-ring-runtime-evidence.json`
- `human-soul-ring-species-runtime-evidence.json`
- `combat-power-runtime-evidence.json`

页面不请求 `douluo2`、`options.json` 或 monolith `route-graph.json`。2026-08-25 的 Day19 focused browser RC 已从新鲜 HTTP 页面验证 RC 专用 entry/index/policy：全部响应 HTTP 200，`loadingFailed=0`；开始人生后只新增 `douluo1` shard 与四类 runtime evidence，没有请求 monolith、`douluo2`、`options.json`、archive manifest 或三个 archive 实体。

`legacyArchive.manifest` 不是 loader 的运行依赖。Day19 archive option 2R 在 manifest 中保留三个 `originalPath`，并将原字节实体映射到 archive 子目录的 `archivePath`；生成器校验路径映射、哈希与 `archivedAt/reason` 语义，页面不得请求这些文件。

## Day19 自动化结果（方案 2 历史结果）

- 8 个 focused 测试文件：83 passed，0 failed。
- RC generator `--check`：pass。
- 完整 `npm.cmd test`：155 passed，20 failed，共 175 项。
- 20 项失败均属于旧 V2 age-6 awakening / production playtest。原因是 archive option 2 要求在原路径保留 e17ec72 `age-6-awakening.json`，而 focused base `main@c7d2978` 的 V2 engine/registry 仍是旧接口。修复需要白名单外 V2 依赖或改变 archive-preservation 决策；当前均未授权。

上述 20 项失败是方案 2 在活跃原路径放置 e17 文件时的历史结果。方案 2R 已恢复活跃路径并迁移归档实体；重新验证结果为 focused 83/83、完整 175/175，generator write/check 通过；当前 focused checkout browser RC 亦已通过。

## 验证状态

当前已自动验证：

- 独立入口存在且旧入口仍存在；
- 默认 seed 第 100 项精确到达 25 岁；
- transcript digest 稳定；
- 完成后不得继续 draw 或增加 cursor/history；
- 单步和按年龄连续推进得到相同最终状态；
- 自定义 seed unresolved 保留 typed boundary 和失败项不提交；
- advancing 状态阻止第二动作；
- 取消发生在完整提交之间；
- V0.5 拒绝非单一 `douluo1` shard。

本轮完整 `npm.cmd test`：`175 passed, 0 failed, 0 cancelled, 0 skipped`。这是本地自动化证据，不等于 CI 或发布验收。

### Day19 focused checkout browser RC（2026-08-25）

- 使用 Codex in-app Browser 从新鲜 `http://127.0.0.1:8080/v05-demo.html` 验收当前 `codex/v05-rc1` checkout。
- 首屏正确显示 `V0.5 RC1 / douluo1 / 0～25 岁`；RC entry/index/policy 与全部页面模块 HTTP 200。
- 开始人生后只请求 `route-graph.douluo1.json` 与四类 runtime evidence；全程无 `loadingFailed`，禁止请求均未出现。
- 单步提交后为0岁/1级、铜灵币500、cursor/history `1/1`，当前 flow 为 `douluo1:flow.formal-human.gender`。
- 逐岁检查点完整覆盖1～25岁。终点为25岁/42级、铜灵币29850、cursor/history `100/100`、currentFlow `douluo1:flow.formal-special-growth`；摘要为铁角牛武魂和4个魂环。
- 完成后单步与连续推进按钮均禁用；页面明确说明第100项完整提交后完成锁阻止后续抽取。
- 刷新后恢复“等待开始”，角色、进度和 history 清空，没有伪装 save/load。
- 390×844 窄屏下四个按钮单列等宽、无横向溢出，开始人生与单步提交正常；全程 console error/warning 为0。
- 临时视口、测试标签页与 HTTP 服务均已恢复或关闭；浏览器 RC 未修改应用文件、Git、PR 或 Pages。

`A-BROWSER-V05-RC` 已在 Codex in-app Browser 验证：

- 默认 seed 从真实入口逐岁推进到25岁，终点为42级、铜灵币29850、cursor/history `100/100`；
- 25岁摘要显示铁角牛武魂和4个魂环，currentFlow 保持 `douluo1:flow.formal-special-growth`；
- 完成后的单步和连续推进按钮均禁用；额外强制触发没有改变 cursor、history、flow 或 completed 状态；
- 刷新后回到“等待开始”，没有保留或伪装 save/load；
- 全程 console 没有 error 或 warning；
- 390×844 窄屏下四个控制按钮按单列等宽排列，开始人生和单步提交正常；
- V1、V2、V3、临时魂环 Demo 和 APK Route Demo 曾在 Day18 原混合工作树中分别打开且没有 console error/warning；这条历史证据不表示 V3、临时魂环 Demo 或 APK Route Demo 已进入 focused PR #5。

Ready 前审计确认：PR #5 没有该提交的 GitHub Actions run，仓库没有提交级 CI workflow、required checks、branch protection 或 ruleset，因此 CI 准确状态为 `unavailable / not configured`，不是 passed；PR review 为 `unavailable`（0 reviews、0 comments、0 review requests）。Pages 仍由 `main / (root)` 发布 `main@c7d2978`，V0.5 公开页面尚未部署或验收。这些状态不得由本地浏览器 RC 推导。

当前 Git 交付为：`codex/v05-rc1@e98bf8a` 已普通 push，Draft PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5) 指向 `main@c7d2978`，47 files、1 commit，merge 状态为 `CLEAN / MERGEABLE`。PR 仍为 Draft；Ready、merge 与 Pages 各自保留独立授权门。

## 授权边界

此前的文件、浏览器、stage、commit、push 与 PR 创建均已在各自独立授权下完成。当前 `A-FILE-DAY19-RC-READY-LOG` 只授权同步四个 Ready 前状态文档；它不授权：

- stage、commit、push 当前文档变更；
- 修改 PR body、转 Ready 或 merge；
- Pages、tag、Release 或 artifact；
- 实现 `official-beast.element` 成功语义；
- 修改 canonical 数据、生成器、archive 或 owner 材料。

下一步仅可对本次四文档差异执行精确范围核验；stage、commit、push 与 `A-READY` 继续分别授权。

## Day19 合并、hotfix 与公开验收收口（2026-08-25）

上面的 Ready 前状态是当时快照；当前交付状态已由后续独立授权闭合：

- focused RC PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5) 已转 Ready，并以 merge commit `67abd4785d5365c8c95816201ef4524688709b21` 合并到 `main`；对应 Pages run [32752990658](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32752990658) 成功。
- 公开页面首次验收发现推进时页面级 `scrollIntoView` 会把视口带到 history 底部。focused hotfix 仅修改 `js/v05-demo-app.js` 与 `test/v05-demo.test.js`，移除页面级自动滚动并增加防跳底回归测试；focused `7/7`、完整 `176/176` 与 whitespace check 均通过。
- hotfix commit `981af0f74142c956a4605a40a19d5b690fc3cb43` 经 PR [#6](https://github.com/MaxwellGuoDUT/douluo-life/pull/6) 以 merge commit `10d33a2bb0f3399df7a18c139848f4330a41ec35` 合并到 `main`；对应 Pages run [32755367252](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32755367252) 成功。
- Codex 对 hotfix 后公开页面的可追溯自动浏览器证据覆盖：开始新人生、shard-only Network、console 0、页面 scroll 保持不跳底，并逐岁推进至21岁。最后一批自动浏览器调用超时，因此不把25岁、完成锁、刷新与窄屏写成 Codex 自动验证完成。
- 项目负责人随后在公开 [`v05-demo.html`](https://maxwellguodut.github.io/douluo-life/v05-demo.html) 完成人工验收，确认不再自动跳底，并通过0～25岁、Network、console、完成锁、刷新与390×844窄屏项目。该结论属于负责人公开人工验收，与前述 Codex 自动浏览器证据分开记录。

V0.5 RC1 当前可准确描述为：`merged to main / Pages deployed / owner public acceptance passed`。本轮只做四文档收口，不再修改功能；tag、GitHub Release、artifact 与 `SHA256SUMS` 均未创建，继续作为独立发布门。

## Day20 玩家可读年表与结局候选（2026-08-26）

`A-DAY20-IMPLEMENT` 在 focused 工作树中新增纯呈现层，不改变现有 draw/commit、RNG、canonical 或 typed-stop 语义：

- 每个成功提交保存不可变的提交前后角色快照，生成年龄、等级、铜灵币、路线、武魂、魂环和魂骨变化标签；
- 年表按静态年龄与跨岁提交分别显示为 `N 岁` 和 `N → N+1 岁`，失败提交不进入年表；
- 25 岁终点新增玩家可读概览、武魂/魂环、魂骨/里程碑与“不是完整人生终局”的明确边界，同时保留原始 JSON 审计摘要；
- reset 清空呈现记录；默认 seed 单步和连续推进仍生成一致 transcript；custom seed 继续在未接 handler 处 typed stop。

本地验证结果：

- `npm test -- test/v05-life-presentation.test.js test/v05-demo.test.js`：`13/13`；
- `npm test`：`182/182`；generator `--check`、相关 `node --check` 和 `git diff --check` 均通过；
- Codex in-app Browser 默认 seed：25岁/42级、铜灵币29850、`100/100`、100条记录、50个静态/跨岁分组、结局可见、完成锁有效、reset 后0条；
- Codex in-app Browser `v05-custom-1`：17岁停于 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，`95/94`、94条成功记录，推进按钮锁定；
- 390×844：无横向溢出，21条已填充记录仍位于 viewport 内；全程 console warning/error 为0。

上述 Browser 是当前本地 checkout 证据；不是 Pages 验收，也不是项目负责人公开人工验收。新增 `.github/workflows/ci.yml` 是未提交、未运行的 Node 24 候选，不能作为 CI passed。`package.json` 的 `0.5.0-rc.1` 同样只是本地候选版本。

本轮明确未触碰 PR #4、V3、临时魂环 Demo、APK Route Demo、`douluo2`、25岁后内容、`official-beast.element`、其他 unresolved handler、save/load、owner 材料与 archive；未 stage、commit、push，也未操作 PR、Pages、tag、Release、artifact 或 `SHA256SUMS`。

## Day20 交付与公开验收（2026-08-27）

上节是本地候选历史。玩家可读呈现层已由精确13路径提交 `7d1e48566366a37dfc7696f97a919c0cefe4ada7` 交付，并经 PR [#8](https://github.com/MaxwellGuoDUT/douluo-life/pull/8) 以 merge commit `35f7c2f20359f07fdb2513517dd262f61b102cb5` 合并到 `main`。

- CI：PR run [33056544343](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33056544343) 与 main push run [33057309608](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33057309608) 均为 success。
- Pages：run [33057308794](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33057308794) 和 deployment `6119825967` 成功，部署 `main@35f7c2f20359f07fdb2513517dd262f61b102cb5`，source 为 `main / (root)`。
- HTTP 活性：公开页面、app module、新 presentation module 与 RC production entry 均返回200；这只证明资源可取回。
- Codex 公开 Browser：确认新年表/变化卡可见且页面不自动跳到底部，推进到8岁、cursor/history `40/40`；控制通道随后超时，因此25岁、custom seed、console、Network 与390×844仍不属于本次 Codex 公开自动闭合项。
- owner public acceptance：默认 seed 到达25岁/42级、铜灵币29850、`100/100`，第100项完整提交；24→25岁变化卡、100个已提交事件、铁角牛与4个魂环、结构化结局、完成锁和边界说明均可见，结构化错误为无。该记录不自动扩展为 owner 对 Network、console、390×844 或 custom seed 的本轮验收。

自动化、Codex 本地 Browser、Codex 公开 Browser、owner acceptance、CI、review、Pages、tag、Release 和 artifact 必须继续分层。RC1 使用 prerelease tag `v0.5.0-rc.1`，精确指向本次文档 closeout 合并后的实时 `main`；不提供自定义 Release asset，不生成 `SHA256SUMS`。

交付没有扩大产品范围：25岁仍是 presentation/release boundary，而不是完整人生终局；PR #4、V3、临时魂环 Demo、APK Route Demo、`douluo2`、25岁后、`official-beast.element`、其他 unresolved handler、save/load、owner 材料和 archive 操作继续排除。

## Day21 本地验证结果（2026-08-28）

- 定向 `test/v05-wheel-view.test.js`、`test/v05-save-store.test.js`、`test/v05-demo.test.js` 为 `19/19`；完整 `npm.cmd test` 为 `193/193`，既有182项全部继续通过并新增11项。
- RC generator `outputs/parallel-prep-2026-08-16/generate-v05-rc-package.mjs --check`、4个相关脚本 `node --check` 与 `git diff --check` 通过。
- Codex in-app Browser 首屏确认中央转盘、两个默认收起的文字 drawer 入口；入口身份池显示12个真实 option、weight 和百分比，成长池显示 weight `20/40/60/80/...` 的真实比例；单步选中 `34bd0a`，高亮、中心最近结果与 runtime 文案一致，页面 scroll 保持0。
- 角色档案显示性别、年龄/等级、铜灵币、路线、武魂/魂环、魂骨和里程碑；人生记事保留年龄分组、变化标签与完整记录。Escape 关闭后焦点返回各自触发按钮。
- 默认 seed 在 `1岁/7级/10项` 做真实刷新，恢复前后 summary、cursor/history、flow/audit、档案和记事逐字段一致；从恢复点继续到25岁后为42级、`100/100`，再次刷新仍保持 completed 锁。
- `v05-custom-1` 到17岁、79级、`95 cursor / 94 history` 后以 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 停止；刷新后恢复同一 boundary，失败项仍未提交。
- 损坏 JSON 在独立本地 origin 上连续两次刷新均以 `V05_SAVE_SCHEMA_INVALID` 拒绝，证明没有自动删除。该验收随后发现坏存档的明确清除按钮被禁用；实现已分离“存档存在”与“兼容可继续”并增加自动化断言，但修复后的 Browser 复测被 in-app Browser URL policy 阻止，因此仍为 partial。
- 390×844 精确设备视口下 `scrollWidth=390`、无横向溢出，转盘宽约344px，drawer 从底部覆盖；reduced-motion media 为 true 时 animation/transition 为 `0.000001s`，结果高亮与 `1/1` cursor/history 正常。
- console error 与 warning 分别读取：默认/完成/boundary 路径、fresh reduced-motion 路径和坏存档路径均为0。
- Browser 尚未直接抽查魂环 pool 的 option/weight：继续单步取样时被 browser security policy 拒绝，未使用其他浏览器或绕过策略。魂环/全部 eligible 几何已有 runtime 自动化覆盖，但不能冒充 Browser 证据。

因此本地代码与自动化为完成；Browser 验收为 `partial`。进入 `A-DAY21-DELIVER` 前建议在允许的 fresh in-app Browser 会话补齐：魂环 pool option/weight 直查，以及坏存档明确清除按钮的修复后复测。

## Day22 正式命运、runtime 闭合与人生图鉴（2026-08-29）

本节覆盖 Day21 的“单 golden seed / schema v1 / official-beast.element unresolved”当前描述；上文仍保留为历史证据。

- 固定 APK 与 `douluo1` module 的 SHA-256 分别为 `E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C` 与 `CD025DBAF024BCCD90B4601B3DAE0850DBE7907CEC9F38AA0ED40D64E3C3E166`。generator 从固定 source handler/mapping 提取8个 pool、144条 exact `official-beast.element` runtime evidence；产物目标摘要为 `1B691D59A3ED8621F96613CFB98E4CDD2143DF1CD4F7D3182A60579523ECBAB6`。
- `official-beast.element` 已按 source context 闭合 human 与 beast 分支：mapping/context/evidence 缺失均 typed reject，commit 原子回滚；handler 不额外消费 RNG，不改变 option weight、requirements 或 eligibility。human 回到正式 scheduler，beast 进入 source 指定的成对血脉 stage pool。
- 对 `v05-destiny-000`～`255` 固定扫描：87条到达25岁；80条 `APK_POOL_HAS_NO_ELIGIBLE_OPTIONS`、17条 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED/beast.martial.unresolved`、28条 `APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED`、11条 `APK_ROUTE_SOUL_RING_EVIDENCE_MISSING`、13条 `UNSUPPORTED_APK_EFFECT`、20条 `V05_ROUTE_TERMINATED_EARLY`。未降低门槛、未吞掉 unresolved、未接第二个 handler。
- 正式 cohort 为 `002, 003, 008, 017, 028, 032, 033, 055, 065, 081, 092, 175` 共12条；拥有12种核心角色画像、12种路线/里程碑组合、12种魂环/成长画像和12个唯一摘要 digest，超过 `4 / 3 / 3` Go 门槛。
- 首屏将12条正式命运作为可访问的单选预设，自定义 seed 位于独立 experimental 区。中央转盘仍只读取 runtime 当前 eligible options、真实 weight 与已经决定的 spin snapshot，不因预设或动画消费 RNG。
- 活动存档升级为 schema v2，绑定 destiny id、seed、内容身份和 replay digest。Day21 v1 ready/completed save 只有同 seed 重放逐字段一致才迁移；旧 boundary 若因本轮闭合而改变，返回 `V05_SAVE_BOUNDARY_SEMANTICS_CHANGED`，不自动推进、不删除原始存档。
- 新增 completed-only 人生图鉴：只在 age25 完成后写入不可变摘要，可去重并选择两条比较武魂、路线、修为、魂环、里程碑和结局；不保存 runner session/history，不能恢复。活动存档、图鉴和当前内存会话使用独立清理入口。
- `apk-route-demo-seed` 继续回归为25岁/42级/`100/100`。`v05-custom-1` 因 element handler 闭合后前进到24岁/91级、`130 cursor / 129 history`，再以 `APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED` 原子停止，保持 experimental。
- 自动化为定向 `73/73`、完整 `207/207`；evidence extractor、destiny cohort generator、RC package generator 的 `--check`，10个相关脚本 `node --check`、5个 generated JSON parse 与 `git diff --check` 全部通过。当前29个 changed paths 全在31路径白名单内。
- Codex in-app Browser 首屏显示12条正式预设；命运002/003/008分别完成为25岁38级/3环/86项、30级/2环/96项、13级/1环/100项。命运002在5岁/21项刷新后确定性恢复并继续完成，completed 再刷新仍锁定且图鉴幂等。
- `v05-custom-1` 页面人生记事显示 `水元素事件 95 · cursor 95` 已提交，继续至24岁/129项后才在 cursor 130 返回新的 followup typed boundary，证明旧 element boundary 已闭合且新失败项未半提交。
- 同源 Day21/Day22 双版本真实 UI 生成并验证 v1 ready、completed、boundary：ready/completed 均显示“Day21 存档迁移完成”；旧17岁/94项 boundary 返回 `V05_SAVE_BOUNDARY_SEMANTICS_CHANGED`、history 0，刷新后原摘要与继续入口仍在。
- 图鉴完成3条收录、重复恢复不增项，并可对比武魂、路线、修为、魂环、魂骨、里程碑和结局。三个 drawer 的 Escape/焦点返回与图鉴 Shift+Tab 循环通过；内存人生、活动 save、图鉴三种 clear 依次验证互不删除。
- 390×844 下 viewport 为 `390×844`、document scroll width 375、转盘宽约343.45px、drawer 为底部375.43px sheet；reduced-motion 为 true 时 animation/transition 均 `1e-06s`。clean Day22 acceptance tab 的 console error/warning 分别为 `0/0`。

Day22 仍只覆盖0～25岁、一个活动存档槽和完成摘要图鉴；不扩展 `douluo2`、25岁后、完整魂兽人生、route graph、其他 handler、owner APK/DOCX/XLSX、workflow、archive preservation 或发布操作。代码、自动化与本地 Browser 验收已完成；所有变更保持 unstaged，未 commit、push、创建 PR、merge、操作 Pages、tag、Release、artifact 或 `SHA256SUMS`。
