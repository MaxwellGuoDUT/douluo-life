# V0.5 Day23 Runtime Coverage 与 Destiny Explorer 决策记录

日期：2026-08-30
授权：`A-DAY23-IMPLEMENT`
focused worktree：`D:\0CODE\douluo-life-v05-day23`
分支：`codex/day23-v05-runtime-coverage-explorer`
结论：`Go / implementation complete / automated verified / Browser verified / ready for A-DAY23-DELIVER`

## 范围与来源锚点

- 实现基线：`origin/main@35edf9664fa3b8e9ccc946bdef14e5cdabbe95b0`。
- APK SHA-256：`E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`。
- `douluo1` module SHA-256：`CD025DBAF024BCCD90B4601B3DAE0850DBE7907CEC9F38AA0ED40D64E3C3E166`。
- route graph SHA-256：`4542F378F1F11B3FB716CF7EAC6905154D8A1FCF428C684C9E5B63D3CDF7E286`。
- 38路径是硬上限；未修改 route graph、scheduler、第三类 handler、`data/v2`、archive preservation、workflow、旧 Demo、owner APK/DOCX/XLSX 或其他 outputs。

## Source Gate 与 runtime closure

- follow-up evidence `--check`：131条记录、50个唯一 prepare、quality 为 ordinary 86、top 33、pure-dragon 7、earth-dragon 5；生成物 SHA-256 为 `4C507DBDC868CC8FB77C54FD7A60A196E2F3123DD8E301F1F57FB7E779E88DA1`。
- human soul-ring evidence `--check`：10池、189条记录、153个 canonical route option 完整；生成物 SHA-256 为 `195ADADA8DF45EB9FBD72D76238B82B76A71ADA2F1EEE78EE21093C8B11165CA`。
- 四个指定 mapping：`7143b4=10年/无魂骨`、`505d78=10年/无魂骨`、`6df424=100000年/有魂骨`、`94604a=300000年/有魂骨`。
- runtime 顺序为 requirements → unique pending context → runtime part draw → commit/reward → return flow；不得额外抽 RNG。evidence、mapping 或 context 缺失均 typed reject，并由测试锁定完整原子回滚。

## Coverage 与正式 cohort

- Day22 baseline 256：completed 87、no-eligible 80、beast-martial unresolved 17、follow-up unresolved 28、soul-ring evidence missing 11、unsupported effect 13、early ending 20；baseline digest `fnv1a32:6bcd4d36`。
- Day23 原256：completed 107，救回20；两个目标 boundary 均为0。
- Day23 全512：completed 218、no-eligible 168、beast-martial unresolved 36、unsupported effect 30、early ending 60；两个目标 boundary 均为0。
- golden seed 保持25岁/42级/`100 cursor / 100 history`；`v05-custom-1` 现为25岁/91级/`131/131`。
- 正式 cohort 恰好24条：`002,003,008,017,028,032,033,055,065,081,092,175,001,013,031,046,083,088,105,117,195,259,260,418`。
- Day22 `official-destiny-01`～`12` 的 ID、seed、digest、profile 均由显式回归锁定。多样性为 core 24、route/milestone 24、growth 20、ring band 4、level band 4、唯一 digest 24；closure 共12条，follow-up 6、soul-ring 6。

## 存档、图鉴与玩家体验

- active save 为 schema v3，仍只有单槽。Day21 v1、Day22 v2 ready/completed 必须同 seed 重放且全字段/digest 一致才迁移。
- Day22 已闭合 follow-up / soul-ring boundary 返回 `V05_SAVE_BOUNDARY_SEMANTICS_CHANGED`，不自动推进且不删除原 save。
- archive v1 先做 integrity，再保守迁移为 v2。path atlas 只收 completed age25，milestone trail 最多8项；不保存 session/history/routeHistory/dynamicHistory/random，且不可恢复。
- 探索器全部由24条 manifest 驱动，提供搜索、武魂/魂环/等级/路线组合筛选、排序、空态、清除和键盘关闭；首屏只保留推荐入口，不复制24套静态业务数据。

## 自动化证据

- 完整 `npm.cmd test`：`220 passed / 0 failed`，原207项保持通过，新增13项。
- follow-up extractor `--check`：pass；ring extractor `--check`：pass；512 cohort generator `--check`：pass；RC package generator `--check`：pass。
- 18个变更 JavaScript/MJS `node --check`：pass；6个 generated JSON parse：pass；`git diff --check`：pass。
- 第二次512产物复核 SHA-256：`2a8072c6287bed32004378f9118b583e2aa6a676790fbbb47e5a240c210c24db`，cohort 24与前述分布不变。
- 统一 `npm run check:v05-evidence` 会先运行白名单外 Day22 `official-beast.element` extractor，并对其旧生成物报告 stale。Day23任务书只要求本轮 follow-up 与 human soul-ring 两个 extractor；二者独立通过。由于 official-beast extractor/evidence 不在38路径白名单，本轮没有重写第39路径，也不把统一脚本记为 pass。

## Codex in-app Browser 证据

Confirmed：

- 全部24条预设可访问；搜索、组合筛选、排序、0结果与清除均通过。
- 013 真实 follow-up prepare 显示事件96，随后真实抽取左臂骨与外附魂骨并完成；001 在 `94604a` 显示三十万年魂环，随后按类型、物种、魂骨部位真实链路提交。
- 001、013、002、003 四条正式命运到25岁；其中002在12岁/17级/44项刷新，页面读取检查点并重放恢复，最后为25岁/38级/86项。
- 001与013两条 closure destiny 进入图鉴；路径摘要最多8项。两人生比较显示武魂、路线、终点等级、魂环、魂骨、里程碑、结局七字段。
- 探索器与角色档案、人生记事、人生图鉴均可用 Escape 关闭并把焦点返回触发按钮；390×844 时 viewport 正确、document scroll width 375、无横向溢出。
- `prefers-reduced-motion: reduce` 命中，动画与过渡均降为 `1e-06s`；命运003、图鉴比较与高阶魂环三张关键页 console error/warning 分别为 `0/0`。

`A-DAY23-BROWSER-MIGRATION-CLOSEOUT` confirmed：

- 真实 Day21 v1 ready `5岁/19级/27项` 与 completed `25岁/42级/100项` 均显示迁移完成；刷新后分别以检查点恢复为原字段，completed 保持完成锁。
- 真实 Day22 v2 ready `5岁/10级/21项` 与 completed `25岁/30级/96项` 均显示迁移完成；刷新后二次恢复字段一致。completed 同 origin 的 archive v1 迁移为 `legacy-summary`，显示 `route:human`、“旧记录未伪造里程碑轨迹”和“不可继续”，没有生成虚假 path trail。
- Day22 follow-up boundary `v05-custom-1 · 24岁/91级 · 130 cursor/129 history` 返回 `V05_SAVE_BOUNDARY_SEMANTICS_CHANGED`，details 保留 `APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED`；Day22 soul-ring boundary `v05-destiny-001 · 17岁/92级 · 91/90` 同样返回 semantics-changed，details 保留 `APK_ROUTE_SOUL_RING_EVIDENCE_MISSING`。两者刷新后原 checkpoint 与继续入口均存在。
- 经负责人即时确认，只删除隔离测试 origin `127.0.0.1:8102` 的合成 key：清空 archive 后 active checkpoint 与内存人生仍为 `25岁/30级/96/96`；重建 archive 后清除 active checkpoint，archive 仍为1条、内存人生仍为 `25岁/38级/86/86`，继续按钮禁用且 checkpoint 显示不存在。
- 六张迁移/semantics-changed 页面及最终 storage 隔离页面 console error/warning 均为 `0/0`。Browser 必测项现已全部有独立 UI 回执，不再依赖自动化替代。

## 决策与回滚锚点

- 所有不可降低的 post-implementation coverage、cohort、digest、diversity、closure 与 golden regression 门槛均通过，代码实现为 Go。
- 旧版迁移、两类 semantics-changed、archive v1→v2 与 storage 隔离的 Browser-only 回执已由 closeout 补齐；Day23 交付决策升级为 `Go`。
- 回滚锚点为未修改的 `origin/main@35edf9664fa3b8e9ccc946bdef14e5cdabbe95b0`。当前全部变化 unstaged；删除 focused worktree/branch 不在本授权内，也未执行。
- 未 stage、commit、push、创建/修改 PR、merge、操作 Pages、tag、Release、artifact 或 `SHA256SUMS`。

## 下一授权建议

建议下一步给 `A-DAY23-DELIVER`，仅授权精确36个实际改动路径的交付范围审计，以及后续分别授权的 stage/commit/push；仍不包含 PR、Pages、tag、Release或RC2发布。
