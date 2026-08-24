# PR #4 description（历史 Draft 范围；Day19 不再作为 RC1 交付载体）

> 这是 PR #4 下一次 `A-PR-EDIT` 使用的待同步草案；当前文件修改不代表远端 PR body 已更新。

> Day19 决策：采用 PR 方案 B，从 `main@c7d2978` 准备 focused V0.5 RC1 PR。PR #4 保持 Draft 历史集成分支，本文件以下内容仅记录其旧范围，不表示已编辑远端 PR、已 Ready 或已合并。focused PR 文案见 `V05_RC1_PR_DESCRIPTION_2026-08-24.md`。

## Summary

本 Draft PR 继续保留 APK canonical route/runtime 的当前可审计范围：

- 所有 APK 提取器和 canonical package generator 共用根 APK SHA `E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`，证据包、route graph、package index 和来源一致性测试已由生成器链重新生成。
- 魂环物种证据覆盖 APK `pt(wt(...))` 明确返回空 effects 的正式选项；`86a2d7` 现标记为 source-verified empty attribute effect，不再被误报为缺证据。
- `applyHumanMartialSoul` 改为显式 operation registry：`formal-human.martial.*` 分派到 `addMartialSoul`；`humanRingSpecies3/4/5` 分派到共享魂环物种收束 primitive；awakening、replacement、beast 分支仍保持 unresolved typed boundary。
- 共享魂环 primitive 覆盖 `setSoulRing`、物种属性、海魂环 water 特殊效果和副武魂补环批次状态，并保持原子回滚。
- 战力只接入当前来源证据能够闭合的差分范围：人类/魂兽基座、魂环、魂骨、神装 100 级门槛、神器、血脉、称号和状态。已修复魂兽称号倍率与人类 100 级神装门槛；未覆盖状态返回 `APK_COMBAT_POWER_UNCOVERED_STATE`，不返回近似总值。该适配器不是“全路线/全状态完整总值”声明。
- route graph 已由生成器产出 compact monolith 与 `douluo1` / `douluo2` 两个 `apk-route-graph-shard/1.0` shard；运行时按 package index 懒加载所选 pack，旧 monolith 仅作审计和兼容回退。
- 发布口径是 `douluo1` typed-boundary Preview。`douluo2` 仅为 `experimental-unverified`，不宣称路线可推进；`official-beast.element` 继续保持 typed unresolved。

## Validation

- `npm.cmd test`: **249 passed, 0 failed, 0 cancelled, 0 skipped**。
- pack-shard、懒加载、来源一致性和固定 seed 定向测试：**17 passed, 0 failed**。
- 新增来源 SHA 一致性、战力差分/typed guard、operation registry、humanRingSpecies3/4/5、主/副武魂补环、official-beast.element unresolved 和原子回滚测试全部通过。
- 固定 seed 本地回放锁定前 83 项摘要；第 84 项为 `humanRingSpecies4/bddfef`，提交后为 21 岁、32 级、cursor/history=84、2000 年第三魂环、土属性 2、无新增武魂。
- 本地继续推进后，第 85 项正常回到 `humanPlan`；下一真实 unresolved boundary 为抽取第 219 项的 official-beast `f16385`，cursor=219、已提交=218、58 岁/91 级。浏览器已复现该边界，并显示 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，要求 `douluo1:handler.official-beast.element`。
- 语义边界：`humanRingSpecies4` 是第 4 类魂兽物种 flow；按 APK scheduler 的 `floor(level / 10)`，32 级时本地第 84 项写入第三魂环槽。第四槽验收需要另有 checkpoint 或独立语义确认，本 PR 不强行改写。
- 生成后的全部 runtime evidence 根 APK SHA 均与 manifest、policy、package index、route graph 一致。
- 精确任务路径的 `git diff --check` 通过。全工作树检查仍会命中明确排除的 owner `index.html` 换行/尾空白，因此没有为通过检查而修改该文件。

## Browser acceptance boundary

- 目标是从全新页面 `apk-route-demo.html` 使用 `apk-route-demo-seed` 重放前 83 项、成功提交第 84 项，并继续到下一真实边界。
- 负责人已从全新页面 `file:///D:/0CODE/douluo-life/apk-route-demo.html` 使用 `apk-route-demo-seed` 完成真实验收：第 84 项页面为 `ready`，当前 flow `humanAfterSoulRing`，年龄/等级 `21 / 32`，cursor/history `84`，铜灵币 `30180`，页面显示土龙已抽取完成且下一 flow 为 `humanAfterSoulRing`。
- 继续重放后，浏览器在第 219 项停于明确兼容边界：页面为 `drawn`，flow/pool 为 `douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577 / f2abac93-6b26-4e3e-aa92-a168db671577`，年龄/等级 `58 / 91`，cursor `219`、已提交 `218`、铜灵币 `72640`；错误为 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，option `f16385`，customHandler `douluo1:handler.official-beast.element`。浏览器页面未显示魂环详细 JSON、土属性计数或武魂数量，这些仍仅按本地自动化结果计入验证范围。
- 负责人随后刷新页面并重新回放到第 219 项，已实测新增结构化字段：页面仍为 `drawn`，flow/pool、58 岁/91 级、铜灵币 `72640`、cursor `219`、已提交 `218` 均一致；`APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 的 details 实际显示 `operationId=beast.element.unresolved`、`operationStatus=unresolved`，并保留 `customHandler=douluo1:handler.official-beast.element`。该 handler 仍未接成成功路径。
- 全新本地页面 Network RC 已确认：首屏不请求 monolith、任一 shard 或 `options.json`；启动 `douluo1` 后只请求 `route-graph.douluo1.json` 与四类 runtime evidence，均 HTTP 200、无加载失败。
- `douluo2` 入口 smoke 只证明 shard 与 `douluo2:flow.start` 可加载；固定 seed 首步 `cd9337` 在 `douluo2:handler.human.country` typed boundary 停止，cursor/history=`1 / 0`，不构成路线可推进证据。

## Packaging and scope

- packaging decision：`docs/review/APK_CANONICAL_PACKAGING_DECISION_2026-08-17.md`；Git 中保留 compact canonical JSON，gzip/Brotli 仅作为未来 Release 传输副本，尚未创建 tag、artifact 或 Release。
- 生成尺寸：compact monolith `29,822,859` bytes；`douluo1` shard `14,268,485` bytes；`douluo2` shard `14,614,706` bytes。Demo 首屏仅加载 entry/index/policy，开始路线后再加载所选 shard 与四类 runtime evidence；`catalogNames: []` 保持不请求 `options.json`。
- Pages source 已迁移到 `main / (root)`；成功部署 run `32360588072` 对应 `main` 的 `c7d2978…`。当前公开站点仍是 main 上的旧版本。Draft 分支 push 不直接改变 Pages，但 merge 到 main 会自动触发公开部署。
- DEVLOG 已区分本地自动验证、浏览器实测、未决和排除材料。
- APK 原文件、`apk-analysis/`、任务书、Word/Excel、archive、负责人生成输出和无关 `index.html` 不进入本 PR；`outputs/parallel-prep-2026-08-16/` 下仅纳入用于复现 canonical package 的生成器与 provenance 模块。
- 本 PR 保持 **Draft**；当前没有 reviews、comments、review threads、commit statuses 或可见 PR workflow runs，不把本地 249 tests 表述为 CI。暂不合并、不 force-push、不重写分支。

完整测试：历史快照 255 passed, 0 failed（不是 Day19 focused checkout 的当前结果）
V0.5 生命周期范围：0–25岁
V0.5 入口：v05-demo.html
浏览器 RC 已通过
douluo1 为 V0.5 主路线
douluo2 shard 随 compact package 保留，但不是 V0.5 公开主线
monolith 作为审计／legacy fallback 保留
PR #4 的历史 archive 悬空问题不再由扩大该 PR 解决；Day19 focused package 以 archive option 2 单独闭合
