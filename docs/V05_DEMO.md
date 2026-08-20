# 斗罗人生 V0.5 Demo

状态：`local implementation / automated-verified / browser-verified / not staged`

日期：2026-08-20

对应任务：Day18 APK canonical `douluo1` 0～25 岁可玩 Demo

## 入口

本地静态服务器启动后打开：

```text
http://127.0.0.1:8080/v05-demo.html
```

也可以直接打开仓库中的 `v05-demo.html`。真实浏览器 RC 应优先使用 HTTP 页面，以便核对 Network、console 和刷新行为。

V0.5 使用独立入口，不替换：

- `index.html`
- `v2-demo.html`
- `v3-demo.html`
- `soul-ring-demo.html`
- `apk-route-demo.html`

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

首屏只调用 production loader 读取：

- `data/production-entry.json`
- `data/apk-canonical/package-index.json`
- `data/apk-canonical/meta/package-policy.json`

开始人生后只指定 `routePackId=douluo1`，并加载：

- `route-graph.douluo1.json`
- `formal-special-result-runtime-evidence.json`
- `human-soul-ring-runtime-evidence.json`
- `human-soul-ring-species-runtime-evidence.json`
- `combat-power-runtime-evidence.json`

页面不请求 `douluo2`、`options.json` 或 monolith `route-graph.json`。`A-BROWSER-V05-RC` 已从新鲜 HTTP 页面实测：首屏只读取页面模块、entry/index/policy；开始人生后只新增 `douluo1` shard 与四类 runtime evidence，全部 HTTP 200，且没有请求 archive manifest。

`legacyArchive.manifest` 不是 loader 的运行依赖；远端悬空引用仍是 PR Ready/merge 前的独立治理问题。

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

本轮完整 `npm.cmd test`：`255 passed, 0 failed, 0 cancelled, 0 skipped`。这是本地自动化证据，不等于浏览器、CI 或发布验收。

`A-BROWSER-V05-RC` 已在 Codex in-app Browser 验证：

- 默认 seed 从真实入口逐岁推进到25岁，终点为42级、铜灵币29850、cursor/history `100/100`；
- 25岁摘要显示铁角牛武魂和4个魂环，currentFlow 保持 `douluo1:flow.formal-special-growth`；
- 完成后的单步和连续推进按钮均禁用；额外强制触发没有改变 cursor、history、flow 或 completed 状态；
- 刷新后回到“等待开始”，没有保留或伪装 save/load；
- 全程 console 没有 error 或 warning；
- 390×844 窄屏下四个控制按钮按单列等宽排列，开始人生和单步提交正常；
- V1、V2、V3、临时魂环 Demo 和 APK Route Demo 均可独立打开，且没有 console error/warning。

仍未验证：GitHub CI、PR review、远端部署与 Pages V0.5 页面。这些状态不得由本地浏览器 RC 推导。

## 授权边界

`A-FILE-V05`、`A-BROWSER-V05-RC` 与 `A-FILE-V05-RC-LOG` 只授权本地实现、浏览器验收和本页证据同步。它们不授权：

- stage、commit、push；
- PR body、Ready 或 merge；
- Pages、tag、Release 或 artifact；
- 实现 `official-beast.element` 成功语义；
- 修改 canonical 数据、生成器、archive 或 owner 材料。

下一阶段进入 Git 前必须先核对混合工作树和 compact packaging 前置资产的精确交付范围；stage、commit、push 继续分别授权。
