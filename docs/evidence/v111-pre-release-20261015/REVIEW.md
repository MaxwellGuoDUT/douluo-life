# V1.1.1 发布前复核与候选交付

2026-10-15，唯一实施目录：C:\Users\Myosotis\.codex\worktrees\v10-randomness-hotfix\douluo-life。

**结论：Conditional Go，可进入获授权后的选择性提交及 PR 阶段。** 本地候选和证据准备完成，未提交、推送、合并、部署、创建 tag 或 Release。此结论不代表线上或所有真机通过。

本复核由同一执行代理另起验证流程完成：重新读差异与规则边界、核对旧证据哈希、检查依赖，从 Git 基线叠加显式白名单构建干净副本，在副本验证，再用真实浏览器核对。未引入第二审阅者或独立代理，不称为外部审阅签字。

## 发现与处置

| 发现 | 风险 | 最终处置与证据 |
| --- | --- | --- |
| Windows CRLF 与 Git/Linux LF 不同，旧 pins 会拒绝正常部署脚本 | P1 发布阻断 | 固定应用文本 LF，生成器拒绝漂移；原 APK 模块字节保留。归档显式关闭本机 autocrlf；110资源通过 Git clean-filter/raw 字节等值与干净候选检查。[复现](line-ending-reproduction.json)、[Git字节](git-byte-consistency.json) |
| 源模块裸 URL 预加载及原 CSS 绕过 import-map URL 映射 | P1 缓存覆盖缺口 | 裸模块 URL 补 integrity；预声明带 SRI 的源 CSS，错误样式阻止启动。实际错误样式端口停止启动，最终68个观察资源均在版本/SRI范围。[浏览器](package-browser.json) |
| 中文别名绕过成长记事原有等级、阶数、品质格式 | P2 展示回归 | 保留元数据及变化比较，补单测；不改原特质 ID、存档或 RNG |
| import maps 与其 integrity 支持不同 | 保留兼容边界 | Chrome/Edge127+、Firefox138+、Safari18+是来源支持信息。旧浏览器只支持 import maps 时可能启动但模块 SRI不保证；无新增修复 Safari/Firefox/真机实测。[来源和范围](COMPATIBILITY.md) |
| 源 APK 有4个缺失的原生插件懒加载引用 | 既存边界 | 原模块与 HEAD 字节一致，当前游戏入口不宣称覆盖原生插件；未改 vault 或补造文件。[依赖核对](independent-checks.json) |

生成 JSON 与 Git 已提交数据字节相同，没有修改数据值。原始源模块逐字节保留。一项拟议的批量 JSON 覆盖被自动审批拒绝且未执行；只读核对证明无需恢复数据，最终以固定换行及正确归档配置解决。

## 验证

- 开工重新核对18个实施文件、156个证据文件的原始 SHA-256，全部匹配。历史 owner 跟踪差异与原始开工补丁一致；其他未跟踪旧材料没有初始全量内容哈希，不夸称全部逐字节核验。
- 从 HEAD 27fe3f505e4103b6d413b28909aa030f3f72d89e 的 Git 基线叠加白名单构建干净副本。110份资源与工作区字节一致，生成检查通过。
- 最终干净副本 **373通过、0失败，另排除1项目标自然重放**。不新增已关闭预算的目标启动；Node24不把该排除项计入总数/skip，日志不是“全374项无例外通过”。上一轮371项完整套件已通过该用例，本轮未改九考调度或存档状态逻辑。[日志](clean-suite.log)、[口径](clean-validation.json)
- 显式配置只读源 vault 检查通过。远端 main、v1.1.0 与既有 CI/Pages 已只读复核，仍对应正式V1.1.0；没有候选CI/Pages结果。
- 18份既有浏览器/自然快照独立严格读取并原样序列化，7组保护对照相等；没有从零重跑自然目标。[复核](independent-checks.json)
- 最终干净候选 Chromium155：201次快照文件选择、导入空槽、主动读档、导出，原始字节一致；普通刷新没有自动恢复，槽保留、主动再读和导出仍一致；中文特质正确。隔离错误源 CSS 停止启动。[截图](package-browser.png)
- 此次实际视口691×635，仅为候选桌面加载/恢复复验，不冒充新窄屏矩阵或真机验收。原窄屏矩阵和用户 Android 回报保留原有范围。

## 范围和发布候选

V1.1.1 修复九考调度、元素展示、窄屏动画及资源加载边界，保持 V1.1.0 /8 存档语义。README、CHANGELOG、首页和 package.json 已对齐候选版本；历史发布说明保留当时语境。未变更 RNG、权重、资格、门槛、年龄、终局或保存机制。

自然九考 confirmed，黄级 unresolved。原自然轮启动246次，超240上限6次，53,500次推进和累计计时时间未超限；原始记录未改写。本轮没有增加目标搜索或目标从零重放。真机仅有用户对已发布V1.1.0的 Android15 Chrome回报；新增修复真机、iOS及 Pages/CDN升级验收仍待补。

[选择性文件清单](candidate-paths.txt)及[逐文件 SHA-256](candidate-files.json)供后续提交核对；候选自身回执哈希另见本地 package-manifest.json。清单排除历史 owner 差异和其他未跟踪材料，禁止整体 add。ZIP及包含ZIP哈希的 package-manifest.json 只留本地，不自行提交。

源码候选ZIP保留仓库历史演示和验证工具；112文件静态ZIP供根游戏入口HTTP预览；证据ZIP包含本轮材料。ZIP固定时间戳，重复构建应字节一致。本地包不代表 GitHub Release 附件或既有 Pages 部署。

[PR草稿](PR_DRAFT.md)、[部署验收与回退操作单](DEPLOYMENT_RUNBOOK.md)、[候选说明](../../V1.1.1_RELEASE_NOTES.md)已准备。选择性提交/推送/PR、合并触发Pages、tag/Release分别等待用户明确授权；黄级继续搜索需独立预算。
