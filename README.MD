# 斗罗人生模拟器

使用 HTML、CSS、原生 JavaScript 和 JSON 构建的斗罗大陆魂师人生转盘模拟器。

## 当前阶段

- V0.5 RC2 Day23 本地候选使用独立入口 `v05-demo.html`，覆盖 `douluo1` 的 0～25 岁展示范围；入口由固定 `v05-destiny-000`～`511` 确定性扫描选出恰好24条正式命运，默认 golden seed 继续作为回归锚点，自定义 seed 明确标记为 experimental。
- 页面以中央真实权重转盘为核心；每个扇区直接复用 runtime 当前 eligible options 的顺序和 weight。动态 handler 无法无副作用预解析时显示明确边界，不猜测概率。
- 角色属性与完整人生年表分别进入“角色档案”和“人生记事”drawer；24条 manifest 驱动命运可搜索、组合筛选和排序。完成到25岁的人生进入独立“人生图鉴”drawer，保存最多8项里程碑的不可恢复路径摘要，并可按武魂、路线、终点等级、魂环、魂骨、里程碑和结局进行双人生比较。
- 每次成功原子提交后写入单浏览器、单站点、单槽的 schema v3 活动检查点。刷新后“继续上次人生”会创建新 runner 并按同 seed 确定性重放；Day21 schema v1 与 Day22 schema v2 只有全字段与 digest 一致才迁移，已闭合的旧 boundary 返回 `V05_SAVE_BOUNDARY_SEMANTICS_CHANGED` 且保留原存档。
- “人生图鉴”使用独立 localStorage key，只接收 completed age25 的 bounded path summary，不保存 session/history/routeHistory/dynamicHistory/random、不可恢复；Day22 archive v1 先验 integrity 后保守迁移为 v2，活动存档、图鉴与内存会话严格隔离。
- V0.5 从 `data/v05-rc/production-entry.json` 加载专用 package index/policy，只请求 `route-graph.douluo1.json`、六类 runtime evidence 与正式命运 manifest；不请求 monolith、`douluo2`、`options.json` 或 archive preservation 文件。
- V0.5 RC1 的玩家可读年表、事件变更卡与结构化结局已由 PR [#8](https://github.com/MaxwellGuoDUT/douluo-life/pull/8) 合并到 `main@35f7c2f20359f07fdb2513517dd262f61b102cb5`，并由 Pages 发布到公开 [`v05-demo.html`](https://maxwellguodut.github.io/douluo-life/v05-demo.html)。
- package 本地候选版本为 `0.5.0-rc.2`；Day23 尚未 stage、commit、push、创建 PR 或部署 Pages。RC1 的既有 CI、Pages、tag 与 prerelease 证据继续作为历史基线，不冒充 RC2 证据。
- 正式 RC 身份采用 GitHub prerelease `v0.5.0-rc.1`，tag 精确指向本次状态文档 closeout 合并后的 `main`；不上传自定义 Release asset，也不生成 `SHA256SUMS`。
- V1 是默认可运行入口，提供早期年度事件玩法。
- V2 是独立的 production playtest 入口，已经具备 Player v2、年度会话、最小 WheelFlowEngine 和原子年度提交。
- V2 页面当前承载第一条完整 production 游戏内容“6 岁武魂觉醒”：依次抽取先天魂力、1～4 个武魂数量、一次共享品质、每槽独立基础形态和 271 项正式目录中的具体武魂，成功后原子推进到 7 岁内容边界。
- 271 项主模式目录包含 233 项 `canon` 和 38 项 `expanded`，同一玩家本次觉醒按定义 ID 无放回抽取。
- 先天 0 级合法且保持 `level = 0` 与魂力成长锁定；品质战力系数为 0% / 10% / 25% / 30%，多武魂叠加上限 100%。
- 该 playtest 不伪造 0～5 岁履历；刷新页面会重置到 6 岁场景起点，当前没有 save/load。
- V2 尚未替代 V1，也尚未实现 save/load、battle 或 ending。

## 运行

ES modules 和 JSON 加载需要通过本地 HTTP 服务器访问仓库目录。

```powershell
python -m http.server 8000
```

然后打开：

- V1：`http://localhost:8000/index.html`
- V2 production playtest：`http://localhost:8000/v2-demo.html`
- V0.5 RC2 本地候选：`http://localhost:8000/v05-demo.html`

## 测试

```powershell
npm test
```

V0.5 玩家呈现层的定向回归：

```powershell
npm test -- test/v05-life-presentation.test.js test/v05-wheel-view.test.js test/v05-save-store.test.js test/v05-demo.test.js
```

如果系统 PATH 中没有 Node.js，请使用 Codex bundled Node.js：

```powershell
& 'C:\Users\Myosotis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test
```

## 项目边界

- V0.5 的 25 岁是 release/presentation boundary，不是完整人生 ending；自定义 seed 仍可在未接语义处 typed stop。
- archive option 2R 在 manifest 中记录三个 `originalPath`，实体原字节保存在 `data/v2/archive/apk-replaced-2026-08-16/` 对应子目录；活跃路径保持 `main@c7d2978` 状态，归档实体不进入 V0.5 runtime 请求。
- V1 与 V2 当前保持独立。
- V2 页面按当前 Player.age 调用 Annual Flow Resolver，不通过数组下标固定 flow。
- 当前没有 confirmed 的 7 岁 production annual flow；页面到达 7 岁后显示内容边界并停止推进。
- `data/v2/examples/` 是技术样例，不是正式游戏内容。
- `data/reference/legacy-wheel/` 是旧数据参考档案，不是 production 数据。
- `inferred` / `provisional` 不得自动升级为 `confirmed`。
- Player 不持久化派生战力，战力由独立计算器即时计算。
- 特殊天赋、0～5 岁、学院、魂环、战斗和存档仍未实现。

当前架构决策见 `docs/DECISION_RECORD_V2.md`，开发进度见 `docs/DEVLOG.md`。
