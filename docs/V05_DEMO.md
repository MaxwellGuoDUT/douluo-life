# 斗罗人生 V0.5 Demo

状态：`V0.5 RC1 focused package / archive 2R / automated-verified / browser-verified / committed and pushed / Draft PR #5 / Ready pre-audit Conditional Go`

日期：2026-08-25（Day19 focused PR Ready 前审计更新）

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
