# V0.5 Day22 Destiny Cohort Decision — 2026-08-29

状态：`Go / local implementation complete / automated verified / Browser verified / unstaged`

## 决策与来源锚点

Day22 从 `origin/main@2928993191c2fab8fd63fd553bf9b34549f28421` 开始，只在任务书31路径最大白名单内工作。固定输入为：

- APK SHA-256：`E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`
- `douluo1` module SHA-256：`CD025DBAF024BCCD90B4601B3DAE0850DBE7907CEC9F38AA0ED40D64E3C3E166`
- element evidence target SHA-256：`1B691D59A3ED8621F96613CFB98E4CDD2143DF1CD4F7D3182A60579523ECBAB6`
- evidence 规模：8个 source pool、144条 exact record

mapping 只来自固定 source handler/mapping；没有依据显示文案、相邻 ID 或默认属性进行推断。`official-beast.element` 的 human context 回到正式 scheduler，beast context 进入 source 指定的成对 stage/bloodline pool。证据、mapping 或 context 缺失时 typed reject 并原子回滚；handler 不额外抽 RNG，也不改 option weight、requirements 或 eligibility。

## 256-seed Go 门槛

扫描域固定为 `v05-destiny-000`～`v05-destiny-255`，safety ceiling 512。结果总和为256：

| 结果 | 数量 |
| --- | ---: |
| completed age25 | 87 |
| `APK_POOL_HAS_NO_ELIGIBLE_OPTIONS` | 80 |
| `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED / beast.martial.unresolved` | 17 |
| `APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED` | 28 |
| `APK_ROUTE_SOUL_RING_EVIDENCE_MISSING` | 11 |
| `UNSUPPORTED_APK_EFFECT` | 13 |
| `V05_ROUTE_TERMINATED_EARLY` | 20 |

87条候选到达25岁，正式 cohort 的核心角色画像、路线/里程碑组合、魂环/成长画像分别为 `12 / 12 / 12`，均超过 `4 / 3 / 3` 门槛，因此结论为 Go。未降低门槛、未伪造预设、未接第二个 handler；其余 unresolved 保持 typed boundary。

## 正式 cohort

| ID | seed | 主武魂 | 路线 | 等级 | 魂环 | commits/cursor | 成长画像 |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 01 | 002 | 精钢重长枪 | `human:cfe7dd:C` | 38 | 3 | 86/86 | growing-3 |
| 02 | 003 | 蚁皇 | `human:a1fc4f:C` | 30 | 2 | 96/96 | growing-2 |
| 03 | 008 | 光明圣龙王 | `human:cfe7dd:D` | 13 | 1 | 100/100 | growing-1 |
| 04 | 017 | 美杜莎 | `human:a1fc4f:A` | 75 | 7 | 117/117 | advanced-7 |
| 05 | 028 | 斗罗星核 | `human:a1fc4f:C` | 47 | 4 | 102/102 | growing-4 |
| 06 | 032 | 生锈的镰刀 | `human:cfe7dd:D` | 0 | 0 | 82/82 | growing-0 |
| 07 | 033 | 神圣天使 | `human:cfe7dd:A` | 92 | 9 | 121/121 | titled-9 |
| 08 | 055 | 铁棍 | `human:cfe7dd:B` | 69 | 6 | 110/110 | advanced-6 |
| 09 | 065 | 双头链锤 | `human:cfe7dd:B` | 87 | 8 | 122/122 | advanced-8 |
| 10 | 081 | 生命古树 | `human:cfe7dd:S` | 94 | 8 | 112/112 | titled-8 |
| 11 | 092 | 血红狒狒 | `human:cfe7dd:B` | 58 | 5 | 110/110 | growing-5 |
| 12 | 175 | 尖刺长鞭 | `human:cfe7dd:C` | 60 | 5 | 103/103 | advanced-5 |

每条正式命运均为 age25、completion lock verified，并具有唯一 transcript、character 与 summary digest。12条主武魂/core profile 不重复；route grade 覆盖 A/B/C/D/S，三枚代表里程碑组成的 route/milestone profile 全部不同；魂环从0到9枚并覆盖 growing、advanced、titled 三组成长画像。

## 存档、图鉴与 UI 决策

- active save 只有一个可恢复槽，schema v2 绑定 destiny id/seed 与内容身份。Day21 v1 ready/completed 必须重放全字段与 digest 一致才迁移。
- Day21 v1 boundary 若命中本轮已闭合语义，返回 `V05_SAVE_BOUNDARY_SEMANTICS_CHANGED`，不自动推进、不删除原 save。
- life archive 使用独立 key，只接受 completed age25 的不可变摘要；不保存 session/history，不能恢复；相同摘要幂等去重。
- active save、archive 与其他 localStorage key 严格隔离；quota/security/bad JSON/unknown schema 不破坏已提交 runtime 状态。
- 首屏显示12个正式预设与独立 experimental seed；三个 drawer 均有文字入口、focus trap、Escape 关闭与焦点返回。中央转盘继续以 runtime 当前 eligible options、真实 weight 和已经决定的结果为唯一真相。

## 回归、partial 与 rollback

- `apk-route-demo-seed`：25岁、42级、100 commits、cursor 100、4魂环，完成锁保持。
- `v05-custom-1`：element 旧 boundary 闭合后，24岁、91级、129 commits、cursor 130，在 `APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED` 原子停止。
- 自动化：定向 `73/73`、完整 `207/207`；evidence extractor、destiny cohort generator、RC package generator 的 `--check` 均通过，10个相关脚本 syntax、5个 generated JSON parse 与 whitespace 均通过。精确29个 changed paths 全在31路径白名单内。
- 保留 partial/unresolved：`beast.martial.unresolved`、followup prepare、soul-ring evidence missing、no-eligible、unsupported effect 和 early ending；自定义 seed 继续 experimental。25岁以后、完整魂兽人生与其他 handler 不在 Day22 授权内。
- rollback 基线是 `origin/main@2928993191c2fab8fd63fd553bf9b34549f28421`；所有 Day22 修改均在本地 `codex/day22-v05-destiny-cohort` focused 工作树且 unstaged。没有 stage、commit、push、PR、merge、Pages、tag、Release、artifact 或 `SHA256SUMS` 操作。

## Codex in-app Browser 验收

- 首屏：12个正式命运按钮全部可见，experimental seed 独立。初始身份池显示12个 runtime eligible options；权重 `100/70/30/50/50/25/30/20/10/25/25/25` 与百分比一致，命运002实际命中“骑士”，高亮项为 `weight 30 · 6.52%`，cursor/history 为 `1/1`。
- 三条正式命运：002、003、008 分别到达25岁 `38级/3环/86项`、`30级/2环/96项`、`13级/1环/100项`，完成锁生效并进入图鉴。002在5岁/21项真实刷新后恢复相同 seed/命运/summary/history，并继续完成；completed 再刷新仍锁定，图鉴计数未重复增加。
- runtime 闭合：experimental `v05-custom-1` 的页面人生记事明确出现 `水元素事件 95 · cursor 95`，随后继续提交到129项，在 cursor 130 才以 `APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED` 原子停止；旧 `beast.element.unresolved` 不再是 boundary。
- Day21 migration：使用同 origin 下 Day21 与 Day22 focused 页面、完全通过 UI 生成 v1 save。ready `1岁/7级/10项` 与 completed `25岁/42级/100项` 均显示“Day21 存档迁移完成”；旧 boundary `17岁/79级/94项` 返回结构化 `V05_SAVE_BOUNDARY_SEMANTICS_CHANGED`，Day22 history 保持0，刷新后原 save 摘要与继续按钮仍在。
- 图鉴与比较：三条 completed 摘要可见且不可恢复；002 对 003 的比较完整显示武魂、路线、修为、魂环、魂骨、里程碑、结局。三个 drawer 均以 close 获得初始焦点，Escape 返回触发按钮；图鉴 Shift+Tab 从 close 循环到最后一个可选人生。
- 三种 clear：放弃当前内存 runner 后 v1 boundary save 与3条图鉴均保留；清除活动 save 后图鉴仍为3；清空图鉴后计数为0且活动 save/内存状态保持为空。每一步只删除对应状态。
- 响应式与 motion：390×844 实测 `innerWidth/innerHeight=390/844`、document `scrollWidth=375`、转盘宽约343.45px、drawer rect 为底部 `375.43×658.31` sheet；`prefers-reduced-motion: reduce` 为 true，wheel animation 与 drawer transition 均为 `1e-06s`。
- console 分层：clean Day22 acceptance tabs 的 error/warning 分别为 `0/0`。迁移搭建首次在同 URL 热切 server 时，缓存的 Day22 module 与 Day21 HTML 混载产生1条 harness `TypeError`；改为同源独立路径后 Day21/Day22 迁移全部通过且 clean tab 不再出现。该搭建错误独立记录，不冒充候选应用错误或忽略。

本地实现、自动化与 Codex Browser 证据均已闭合，建议下一授权为 `A-DAY22-DELIVER`，仅处理精确 stage/commit/push/PR 等交付动作；本轮没有执行这些动作。
