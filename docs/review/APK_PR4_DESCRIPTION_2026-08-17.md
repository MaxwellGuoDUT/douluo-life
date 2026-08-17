# PR #4 description（2026-08-17，已同步）

> 这是 PR #4 当前收窄版 body，已通过已认证的 GitHub CLI 同步到远端。

## Summary

本 Draft PR 继续保留 APK canonical route/runtime 的当前可审计范围：

- 所有 APK 提取器和 canonical package generator 共用根 APK SHA `E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`，证据包、route graph、package index 和来源一致性测试已由生成器链重新生成。
- 魂环物种证据覆盖 APK `pt(wt(...))` 明确返回空 effects 的正式选项；`86a2d7` 现标记为 source-verified empty attribute effect，不再被误报为缺证据。
- `applyHumanMartialSoul` 改为显式 operation registry：`formal-human.martial.*` 分派到 `addMartialSoul`；`humanRingSpecies3/4/5` 分派到共享魂环物种收束 primitive；awakening、replacement、beast 分支仍保持 unresolved typed boundary。
- 共享魂环 primitive 覆盖 `setSoulRing`、物种属性、海魂环 water 特殊效果和副武魂补环批次状态，并保持原子回滚。
- 战力只接入当前来源证据能够闭合的差分范围：人类/魂兽基座、魂环、魂骨、神装 100 级门槛、神器、血脉、称号和状态。已修复魂兽称号倍率与人类 100 级神装门槛；未覆盖状态返回 `APK_COMBAT_POWER_UNCOVERED_STATE`，不返回近似总值。该适配器不是“全路线/全状态完整总值”声明。

## Validation

- `npm.cmd test`: **245 passed, 0 failed, 0 cancelled, 0 skipped**。
- 新增来源 SHA 一致性、战力差分/typed guard、operation registry、humanRingSpecies3/4/5、主/副武魂补环、official-beast.element unresolved 和原子回滚测试全部通过。
- 固定 seed 本地回放锁定前 83 项摘要；第 84 项为 `humanRingSpecies4/bddfef`，提交后为 21 岁、32 级、cursor/history=84、2000 年第三魂环、土属性 2、无新增武魂。
- 本地继续推进后，第 85 项正常回到 `humanPlan`；下一真实 unresolved boundary 为抽取第 219 项的 official-beast `f16385`，cursor=219、已提交=218、58 岁/91 级。浏览器已复现该边界，并显示 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，要求 `douluo1:handler.official-beast.element`。
- 语义边界：`humanRingSpecies4` 是第 4 类魂兽物种 flow；按 APK scheduler 的 `floor(level / 10)`，32 级时本地第 84 项写入第三魂环槽。第四槽验收需要另有 checkpoint 或独立语义确认，本 PR 不强行改写。
- 生成后的全部 runtime evidence 根 APK SHA 均与 manifest、policy、package index、route graph 一致。
- 本地语法检查和 `git diff --check` 通过。

## Browser acceptance boundary

- 目标是从全新页面 `apk-route-demo.html` 使用 `apk-route-demo-seed` 重放前 83 项、成功提交第 84 项，并继续到下一真实边界。
- 负责人已从全新页面 `file:///D:/0CODE/douluo-life/apk-route-demo.html` 使用 `apk-route-demo-seed` 完成真实验收：第 84 项页面为 `ready`，当前 flow `humanAfterSoulRing`，年龄/等级 `21 / 32`，cursor/history `84`，铜灵币 `30180`，页面显示土龙已抽取完成且下一 flow 为 `humanAfterSoulRing`。
- 继续重放后，浏览器在第 219 项停于明确兼容边界：页面为 `drawn`，flow/pool 为 `douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577 / f2abac93-6b26-4e3e-aa92-a168db671577`，年龄/等级 `58 / 91`，cursor `219`、已提交 `218`、铜灵币 `72640`；错误为 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，option `f16385`，customHandler `douluo1:handler.official-beast.element`。浏览器页面未显示魂环详细 JSON、土属性计数或武魂数量，这些仍仅按本地自动化结果计入验证范围。
- 负责人随后刷新页面并重新回放到第 219 项，已实测新增结构化字段：页面仍为 `drawn`，flow/pool、58 岁/91 级、铜灵币 `72640`、cursor `219`、已提交 `218` 均一致；`APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 的 details 实际显示 `operationId=beast.element.unresolved`、`operationStatus=unresolved`，并保留 `customHandler=douluo1:handler.official-beast.element`。该 handler 仍未接成成功路径。

## Packaging and scope

- packaging decision：`docs/review/APK_CANONICAL_PACKAGING_DECISION_2026-08-17.md`；当前保留 generator 产出的 canonical JSON，pack-level route shard 和压缩 Release artifact 作为后续决策路径，尚未发布。
- DEVLOG 已区分本地自动验证、浏览器实测、未决和排除材料。
- APK 原文件、`apk-analysis/`、任务书、Word/Excel、archive、负责人生成输出和无关 `index.html` 不进入本 PR；`outputs/parallel-prep-2026-08-16/` 下仅纳入用于复现 canonical package 的生成器与 provenance 模块。
- 本 PR 保持 **Draft**；不合并、不 force-push、不重写分支。
