# 斗罗人生模拟器 Day 13 开发任务书

> **HISTORICAL TASK RECORD**：本文是已完成的 Day 13 任务书，仅用于保存任务范围、验收要求与决策历史，不是当前开发指令。

## 第一条正式 V2 游戏内容：6 岁武魂觉醒

状态基准日期：2026-08-07
项目目录：`D:\0CODE\douluo-life`
目标分支：`codex/day10-v2-combat-foundation`
基准 HEAD：`6560d05 feat: add v2 annual session vertical slice`

---

# 一、任务性质

这是一次“从 V2 技术样机进入正式游戏内容”的阶段转换任务。

本轮不要继续横向扩建大量 V2 基础设施。

核心原则：

> 从现在开始，V2 新基础设施必须由真实游戏内容需求驱动，而不是因为“以后可能有用”而预先实现。

当前 V2 已经拥有足够的基础能力，应优先用第一条正式内容验证现有架构。

本轮唯一主目标：

> 完成第一条正式 V2 游戏内容切片：“6 岁武魂觉醒”。

成功后，项目应第一次形成：

```text
Player v2
→ AnnualSession
→ 正式武魂觉醒 flow
→ WheelFlowEngine
→ effects
→ history / spin
→ V2SessionRunner 原子提交
→ 6 岁成功结束后推进至 7 岁
```

V1 必须继续独立、正常运行。

---

# 二、开始工作前必须确认的项目事实

不要直接修改代码。

首先检查工作区、当前分支、HEAD、已有实现和测试。

至少执行：

```powershell
git branch --show-current
git rev-parse --short HEAD
git status
git diff --cached --stat
git diff --cached --check
```

预期基准：

```text
branch:
codex/day10-v2-combat-foundation

HEAD:
6560d05
```

当前报告记录：

```text
71 tests
71 pass
0 fail
0 skipped
```

另有：

* 17 个 JavaScript 文件语法检查通过；
* V1 new-game smoke test 已通过；
* V2 连续三年度集成测试已通过；
* 年龄只推进一次；
* spin/history 正常累计；
* V2 年度失败不会留下半提交状态；
* Player 不持久化派生战力字段。

如果现场代码和这些事实不一致：

1. 不要擅自覆盖现场状态；
2. 以当前仓库真实状态为准；
3. 明确记录差异；
4. 判断是否能够继续本任务；
5. 若差异不会破坏任务目标，则继续工作；
6. 不要为了强行匹配任务书而回滚已有新工作。

---

# 三、当前架构基线

## V1

V1 仍然是当前默认网页游戏入口。

入口：

```text
index.html
```

主要特点：

* Player v1；
* Game v1；
* 每年龄传统事件推进；
* 已有出生、成长、武魂觉醒、学院等早期内容；
* 可以运行；
* 不能因为本轮 V2 开发而被破坏。

V1 当前没有正式 save/load、battle、ending 闭环。

本轮禁止顺带修复这些问题。

---

## V2

V2 当前是独立样机。

入口：

```text
v2-demo.html
```

当前已经具备：

* Player v2；
* Player v1 → v2 纯迁移适配器；
* v1/v2 兼容只读 selector；
* Event Schema v2 validator；
* RouteState；
* AnnualSession；
* 配置驱动的派生战力计算器；
* WheelFlowEngine；
* `roll`；
* `end`；
* `same_year`；
* `next_year`；
* 年度边界；
* V2SessionRunner；
* 年度原子提交；
* spin/history；
* 可注入 deterministic RNG；
* 独立 V2 demo；
* 连续三年度集成测试。

当前 WheelFlowEngine 已知 node op：

```text
roll
end
```

当前 advance：

```text
same_year
next_year
end
```

尚未完整实现：

```text
gate
repeatWheel
dispatchWheel
setRoute
完整 RouteState runtime
terminal
完整 sessionContext 写入
save/load
battle
ending
```

这些不是本轮待办清单。

除非“6 岁武魂觉醒”的 confirmed 内容确实无法由现有能力表达，否则本轮不得实现它们。

---

# 四、架构冻结原则

从本任务开始执行以下规则：

> 禁止为了架构完整性提前增加 WheelFlowEngine 能力。

任何新增 engine op 都必须对应一个明确、已经确认的内容需求。

不能接受以下理由：

```text
以后可能会需要
为了完整
设计文档里规划过
旧转盘可能用得到
这样更通用
```

只能接受：

```text
当前 6 岁 confirmed 武魂觉醒流程中的具体步骤 X，
无法通过现有 roll/end/same_year/next_year 正确表达。
```

如果现有能力能够完成第一版觉醒流程：

> 不新增任何 WheelFlowEngine op。

---

# 五、年龄推进语义正式定稿

本任务必须统一代码、测试与文档中的年龄推进语义。

最终规则采用当前 Day12 / V2SessionRunner 的事务式方案。

废止旧 DR-007 中：

```text
Game.advanceYear()
→ age + 1
→ 创建年度会话
→ 执行本年度流程
```

的预增年龄逻辑。

正式规则：

```text
Player.age 表示玩家当前正在经历的年龄。

基于当前 player.age 创建 AnnualSession。

执行该年龄的完整年度 flow。

只有年度全部成功后，
V2SessionRunner 才允许原子提交年度结果。

若最终 advance = next_year：
提交完成时 player.age += 1。

若年度执行过程中失败：
Player / age / history / spin / route 等持久状态不得留下半提交结果。
```

详细语义：

```text
same_year
→ 当前年度继续
→ 不增加 age

next_year
→ 当前年度成功结束
→ 原子提交
→ age + 1

end
→ 当前 flow 结束
→ 不隐式增加 age

异常 / invalid / 无法完成年度
→ 不推进 age
→ 不留下半提交 Player 状态
```

不要让：

```text
end
```

隐含：

```text
age + 1
```

未来死亡、结局、终止流程需要独立语义。

如果当前代码已经完全符合以上规则：

> 不要为了“重构”而重写代码。

只需：

* 补充或确认测试；
* 更新决策记录；
* 更新 AI_CONTEXT 等真相源。

---

# 六、第一阶段：处理当前 Git staging

当前报告显示存在：

```text
13 staged files
67,412 insertions
```

内容混合了：

* 当前架构文档；
* 历史任务书；
* 状态快照；
* 战力设计材料；
* Wheel Flow 设计材料；
* legacy wheel 数据；
* 转换工具；
* AI_CONTEXT 修改。

它们不应该作为一个整体提交。

首先检查：

```powershell
git status
git diff --cached --stat
git diff --cached --check
```

如果现场仍然与报告一致，则执行：

```powershell
git restore --staged .
```

注意：

> `git restore --staged .` 只取消暂存，不删除工作区文件。

执行后再次：

```powershell
git status
```

确认原有负责人材料全部仍在。

严禁：

```powershell
git add .
```

后续只允许针对明确文件或明确目录进行显式 staging。

不要删除负责人提供的任务书、参考资料、转换结果或历史材料。

不要为了整理目录擅自移动大量负责人材料。

---

# 七、第二阶段：收口当前项目真相源

这一步要短，不要演变成“大型文档整理项目”。

重点检查：

```text
docs/DECISION_RECORD_V2.md
docs/AI_CONTEXT.md
README.md
```

以及当前 Wheel Flow 设计文档。

如果没有合适的状态索引，可以新增一个简单文件，例如：

```text
docs/STATUS_INDEX.md
```

但不是强制。

---

## 7.1 修改 DECISION_RECORD_V2

找到旧 DR-007。

将年龄语义更新为本任务第五节规定的：

```text
当前年龄创建 AnnualSession
→ 年度流程执行
→ 全部成功
→ V2SessionRunner 原子提交
→ next_year 才执行 age + 1
```

文档需要明确说明旧决策已被后续实现取代。

不要留下两套互相矛盾、却看起来都有效的规则。

---

## 7.2 修改 AI_CONTEXT

当前报告指出：

```text
docs/AI_CONTEXT.md
```

仍把已经实现的 WheelFlowEngine 描述为“规划中”。

必须修正。

更新后至少要准确表达：

```text
V1：
仍为默认可运行入口。

V2：
Player v2 已有。
Event Schema v2 validator 已有。
RouteState / AnnualSession 已有。
WheelFlowEngine 最小 runtime 已有。
V2SessionRunner 年度原子提交已实现。
独立 v2-demo 已有。
已有连续年度技术垂直切片。

当前下一目标：
第一条正式 V2 游戏内容：6 岁武魂觉醒。

V2 尚未：
切换主入口；
形成完整正式内容库；
实现 save/load；
实现 battle；
实现 ending。
```

---

## 7.3 历史状态快照

例如：

```text
docs/PROJECT_STATUS_FOR_WEB_CHATGPT_2026-08-02.md
```

属于历史快照。

不要重写成当前状态。

不要删除。

应该通过：

* 文件头说明；
* README；
* STATUS_INDEX；
* 或其他最小方式

明确：

```text
HISTORICAL SNAPSHOT
```

而不是：

```text
CURRENT PROJECT STATUS
```

---

## 7.4 README

如果仓库缺少真正可用的 README，补充一个最小版本。

README 不需要写成长篇架构论文。

至少应该回答：

```text
项目是什么？
V1 怎么运行？
V2 demo 怎么运行？
测试怎么运行？
V1 与 V2 当前是什么关系？
当前开发阶段是什么？
```

保持简洁。

---

# 八、第三阶段：定义第一条正式 V2 内容

## 内容名称

```text
6 岁武魂觉醒
```

这是第一条 production V2 游戏内容。

不要把：

```text
data/v2/examples/
```

中的测试样例直接当作正式内容。

正式 production data 应与 examples 明确区分。

优先沿用仓库已有数据目录规范。

如果当前尚无正式 V2 内容目录，可以根据当前项目结构建立最小清晰结构，例如：

```text
data/v2/content/
data/v2/flows/
data/v2/wheels/
```

但不要为了目录设计进行大规模重构。

---

# 九、6 岁觉醒第一版的严格范围

目标不是完成“完整武魂系统”。

只完成：

```text
age = 6
↓
进入正式 awakening annual flow
↓
随机产生正式武魂觉醒结果
↓
写入必要 Player v2 状态
↓
处理必要的先天魂力结果
↓
记录 spin/history
↓
年度成功
↓
next_year
↓
age = 7
```

第一版应该尽量小。

---

# 十、正式内容来源规则

只能使用：

```text
confirmed
```

内容。

严禁：

```text
inferred → 自动升级 confirmed
provisional → 自动升级 confirmed
```

旧转盘参考库中：

```text
orderedWheelIds
```

只代表候选顺序或参考顺序。

不得把：

```text
WheelID 相邻
```

解释成正式剧情跳转。

不得根据 ID：

```text
自动生成 nextWheelId
```

如果旧内容中的跳转关系未经确认：

> 不使用该关系。

如果某个内容事实无法从当前正式资料确认：

> 宁可缩小第一版范围，也不要猜。

---

# 十一、“你选择”仍然是随机叙事

旧数据或叙事标题中出现：

```text
你选择……
```

不代表：

```text
玩家点击选择按钮
```

本项目当前设计仍然是：

> 转盘随机人生模拟。

不得因为文字里有“你选择”而引入玩家主动选择 UI。

---

# 十二、先尝试完全使用现有 WheelFlowEngine

实现觉醒 flow 时，第一轮必须尝试只使用：

```text
roll
end
same_year
next_year
```

例如概念上：

```text
age 6 annual flow

roll awakening
→ same_year

roll innate soul power
→ next_year
```

具体是否需要一个还是两个 roll，以当前 confirmed 数据结构与已有 V1 逻辑为依据。

不要为了符合这个示例而强制拆成两个 roll。

---

# 十三、如果现有 engine 不够怎么办

如果遇到真实架构缺口：

1. 暂停新增 op；
2. 明确写出具体 blocked case；
3. 回答：

```text
哪一条 confirmed 游戏内容无法表达？
为什么现有 roll/end/same_year/next_year 无法表达？
最小新增能力是什么？
是否存在不扩 engine 的更简单表达？
```

只有确认无法用当前能力正确表达后，才允许实现最小扩展。

---

# 十四、新能力优先级

若确实需要扩展，优先考虑：

```text
dispatchWheel
```

但只有存在类似真实需求时：

```text
觉醒结果 A
→ 后续 wheel A

觉醒结果 B
→ 后续 wheel B
```

才实现。

本轮默认不要实现：

```text
gate
repeatWheel
setRoute
terminal
完整 RouteState runtime
完整 sessionContext
```

---

# 十五、Annual Flow Resolver / Registry

本轮可能真正缺少的最小能力不是新的 Wheel op，而是：

```text
当前年龄应该运行哪一个正式 annual flow？
```

例如第一版概念：

```text
age 6
→ awakening flow
```

如果当前代码中已经存在合适机制：

> 复用它。

如果没有：

> 可以实现一个最小、明确、低抽象的 annual flow resolver / registry。

第一版只需要解决当前真实需求。

例如：

```text
6 → awakening
```

不要直接设计复杂 DSL。

不要提前实现：

```text
age
+ route
+ faction
+ tags
+ combat
+ previous events
→ generic rule engine
```

将来出现真实内容需求后再扩展。

注意职责分离：

```text
Annual Flow Resolver
```

负责：

```text
今年执行哪个 flow？
```

而：

```text
WheelFlowEngine
```

负责：

```text
这个 flow 怎么执行？
```

不要无必要地把两者揉成一个巨型 engine。

---

# 十六、Player v2 数据规则

必须继续维护现有不变量。

Player 不允许持久化派生战力：

```text
combatPower
staticCombatPower
effectiveCombatPower
```

战力继续作为：

> 配置驱动的只读派生结果。

不要因为觉醒需要显示战力，就把战力字段写回 Player。

---

# 十七、测试要求

本轮不是“页面能打开”就完成。

必须有自动化测试。

至少覆盖以下情况。

---

## 17.1 正常 6 岁流程

初始：

```text
age = 6
```

执行正式 awakening annual flow。

成功后：

```text
age = 7
```

且只推进一次。

---

## 17.2 deterministic RNG

使用固定 RNG。

确保相同输入和 RNG：

```text
→ 相同武魂觉醒结果
→ 相同先天魂力结果
```

不能让正式测试依赖真正随机结果。

---

## 17.3 effects

确认 awakening 产生的 Player v2 状态修改正确。

不要只确认：

```text
函数没有报错
```

要检查具体 Player state。

---

## 17.4 spin

确认本年度产生的 spin 数量、顺序和内容符合 flow。

---

## 17.5 history

确认正式觉醒结果被记录到正确的历史结构。

不要使用只适合 demo 的临时字符串代替正式结构。

---

## 17.6 next_year

关键断言：

成功前：

```text
age = 6
```

成功后：

```text
age = 7
```

不得：

```text
age = 8
```

---

## 17.7 无候选 / invalid

如果某一步没有合法 candidate：

年度必须失败或按照现有明确错误规则处理。

不得产生半状态。

---

## 17.8 rollback / 原子性

故意制造年度中途失败。

失败前：

```text
age = 6
```

失败后仍应：

```text
age = 6
```

并确认：

```text
Player effects 未半提交
history 未半提交
spin 不留下不一致持久状态
RouteState 如涉及也不得半提交
```

---

## 17.9 V1 regression

继续运行 V1 smoke test。

本轮 V2 修改不得破坏：

```text
index.html
Player v1
Game v1
V1 new game
```

---

# 十八、测试命令

优先根据仓库已有测试命令执行。

至少完成：

```powershell
node --test
```

所有被修改或新增的 JavaScript 文件进行：

```powershell
node --check <file>
```

最终不是只运行 awakening 新测试。

必须重新运行完整测试集。

验收要求：

```text
0 fail
0 skipped
```

除非仓库原本就存在明确、记录在案的 skip。

如果测试总数从 71 增加，是正常现象。

最终报告要写：

```text
XX tests
XX pass
0 fail
```

---

# 十九、浏览器测试

浏览器控制能力属于 P1。

它不阻塞本轮核心功能。

只有在前面的：

```text
文档语义收口
正式内容
运行时
自动化测试
```

完成后，才投入浏览器 smoke test。

---

## 浏览器最低验收

如果当前 Codex 环境具备浏览器控制能力：

### V1

打开：

```text
index.html
```

实际点击：

```text
开始人生
```

再推进至少一次。

确认：

```text
页面无明显错误
关键 DOM 正常变化
console 无异常
```

### V2

打开：

```text
v2-demo.html
```

实际推进。

检查：

```text
age
spin
history
combat power display
warning
console
```

至少完成连续年度真实点击 smoke test。

---

# 二十、浏览器能力不可用时

不要陷入无限排查。

如果浏览器控制目前不可用：

1. 明确测试到哪一步；
2. 记录失败层级；
3. 保留自动化测试结果；
4. 浏览器测试标记为待补；
5. 不阻塞 6 岁正式内容完成。

不要用：

```text
HTTP 200
文件存在
静态资源可读取
```

冒充真实浏览器验收。

---

# 二十一、legacy wheel 数据本轮处理边界

旧转盘参考库共约 510 个 wheel。

本轮：

> 不进行全量迁移。

只允许为了确认“6 岁武魂觉醒”内容而读取必要的少量参考数据。

不要：

```text
批量生成 production V2 wheels
批量推断跳转
批量确认内容
```

reference 必须继续保持 reference 身份。

---

# 二十二、Git 文件分组原则

当前 13 个 staged 文件取消整体暂存后，应按照性质分组。

建议至少分成：

## A. 当前真相源

例如：

```text
docs/AI_CONTEXT.md
docs/DECISION_RECORD_V2.md
README.md
STATUS_INDEX（若新增）
当前 Wheel Flow 正式设计文档（若需要同步）
```

这是当前有效架构信息。

---

## B. 历史开发资料

例如：

```text
Day11 大型任务书
Day12 任务书
2026-08-02 状态快照
历史大型设计输入
```

这些应被明确视为：

```text
historical / archive / planning input
```

不要与“当前项目真相”混淆。

---

## C. legacy reference/tooling

例如：

```text
data/reference/legacy-wheel/
旧转盘转换工具
转换结果
```

必须明确：

```text
reference ≠ production
inferred ≠ confirmed
```

---

# 二十三、关于 commit / push

本任务可以：

* 修改文件；
* 新增必要文件；
* 取消当前混合 staging；
* 显式 stage 文件用于检查；
* 查看 diff；
* 准备合理的 commit 边界。

但不要：

```text
git add .
```

不要删除负责人材料。

不要 force push。

不要 reset --hard。

不要执行 destructive clean。

如果没有得到明确额外授权：

> 本轮完成实现、测试和 Git 分组后，先不要 push。

如果当前既有项目约定要求由 Codex 创建本地 commit，可以只在所有验收通过后按照单一意图创建小型 commits；若存在任何不确定，则保持工作区修改并在最终报告中给出建议 commit 方案，不擅自提交。

优先保证：

> 文件安全和提交边界清晰。

---

# 二十四、建议的 commit 边界

若最终获准提交，可考虑：

```text
docs: align v2 architecture decisions and project context
```

用于：

```text
DR-007
AI_CONTEXT
README
status index
```

正式 6 岁内容与必要运行时修改使用独立 commit，例如：

```text
feat: add production age-6 awakening flow
```

测试如果与 feature 紧密耦合，可以和 feature 同 commit。

legacy reference/archive 材料不要混入以上 feature commit。

---

# 二十五、本阶段明确不做

以下项目全部禁止顺带开发：

```text
510 个旧转盘全量迁移
完整 battle system
battle.json 内容扩建
ending system
ending.json 内容扩建
save/load
localStorage
下载/上传存档
完整 RouteState runtime
宗门系统
武魂殿路线
学院完整迁移
第一魂环完整系统
完整双生武魂系统
完整武魂变异系统
武魂融合
完整 sessionContext
repeatWheel 泛化
gate 泛化
terminal
神位
神器
称号
魂核
魂兽战力
99 级正式平衡
战力差 → 战斗胜率权重
完整 UI redesign
主入口切换到 V2
V1 大规模重构
设置按钮
继续游戏按钮
大规模剧情扩写
```

如果发现其中某一项“似乎顺手就能做”：

> 仍然不要做。

记录为 future work 即可。

---

# 二十六、开发顺序

严格按以下顺序执行。

## Task 1：现场检查和 staging 收口

目标：

```text
确认仓库真实状态
解除 67k 行混合 staging
保证所有负责人材料安全
```

完成条件：

```text
没有混合 staging 包
没有文件丢失
git status 清晰可解释
```

---

## Task 2：年龄语义与真相源文档定稿

目标：

```text
DR-007 与当前 V2SessionRunner 一致
AI_CONTEXT 与当前实现一致
历史 snapshot 不再冒充 current truth
README 可以让新 agent 理解项目
```

完成条件：

```text
git diff --check
```

无格式错误。

---

## Task 3：建立第一条正式 V2 6 岁觉醒内容

目标：

```text
production data
≠ examples
```

并且内容全部来自 confirmed 信息。

完成条件：

```text
Event Schema v2 validator 通过
```

不能出现：

```text
inferred 自动确认
WheelID 猜剧情
主动玩家选择按钮
```

---

## Task 4：使用最小运行时跑通 6 岁年度

优先完全使用现有：

```text
roll
end
same_year
next_year
```

若需要，增加最小 annual flow resolver。

只有确实被 confirmed 内容阻塞后才允许新增 engine op。

完成条件：

```text
age 6
→ 正式 awakening
→ effects
→ history/spin
→ next_year
→ age 7
```

---

## Task 5：补测试和全量回归

完成：

```text
正常路径
deterministic RNG
effects
spin
history
age 6 → 7
no candidate
rollback
V1 regression
```

最终：

```text
all tests pass
```

---

## Task 6：浏览器 smoke test

只有前五项完成后执行。

浏览器工具不可用不阻塞主任务。

---

# 二十七、遇到不确定情况时的决策规则

不要因为有一点不确定就停下来要求负责人手动回答。

优先：

1. 阅读当前代码；
2. 阅读最近测试；
3. 阅读当前有效设计文档；
4. 阅读 V1 武魂觉醒实现；
5. 阅读必要的 legacy reference；
6. 使用最保守、最小范围方案。

但有以下红线：

如果某个具体游戏事实只能靠猜测：

> 不要猜。

缩小内容范围。

如果一个新引擎能力只是“可能以后有用”：

> 不实现。

如果一个旧文档与当前代码/测试冲突：

> 当前代码和测试事实优先，同时修订文档。

如果 historical task brief 与当前任务书冲突：

> 本 Day 13 任务书优先。

---

# 二十八、代码质量原则

新增代码应：

* 延续当前项目风格；
* 保持职责单一；
* 不引入无必要的依赖；
* 不重构无关模块；
* 不把 demo 逻辑硬编码到 production engine；
* 不把 production 内容写死进 UI；
* 不让 Player 持久化派生战力；
* 保持 deterministic testing 可能；
* 保持 V1/V2 隔离。

不要为了“代码更漂亮”修改大量无关文件。

---

# 二十九、完成状态定义

本任务完成时，项目应该能够准确描述为：

> V1 保持独立可运行。
>
> V2 已从纯技术样机正式进入游戏内容承载阶段。
>
> Player v2、AnnualSession、WheelFlowEngine 与 V2SessionRunner 已经承载第一条 production 游戏内容“6 岁武魂觉醒”。
>
> 该年度 flow 能够通过 deterministic RNG 进行自动化测试，能够正确应用正式 effects、记录 spin/history，并且只有在年度成功完成后才原子推进年龄。
>
> 6 岁成功年度结束后进入 7 岁；失败时仍保持 6 岁，且 Player/history 等状态不存在半提交污染。
>
> V1 未发生回归。
>
> production content 与 examples、legacy reference 已明确区分。
>
> 尚未切换 V2 为主游戏入口，也尚未开始 save/load、battle、ending、路线系统和旧转盘全量迁移。

---

# 三十、最终报告格式

完成工作后，不要只回复：

```text
Done
```

请给负责人一份简洁但信息完整的开发报告。

必须包括：

## 1. 实际完成

列出：

```text
修改了什么
新增了什么
为什么需要
```

---

## 2. 实际文件

列出所有新增和修改文件。

不要只列目录。

---

## 3. 年龄语义

明确说明最终实现：

```text
年度成功后原子推进
```

以及是否修改了任何运行时代码。

---

## 4. 6 岁觉醒 flow

说明：

```text
入口
节点
roll
effects
history
advance
```

实际结构。

---

## 5. Engine 扩展

必须明确回答：

```text
是否新增 WheelFlowEngine op？
```

如果没有：

```text
没有，现有能力足够。
```

如果有：

说明：

```text
具体 confirmed 内容需求是什么？
为什么旧能力无法实现？
新增了哪个最小能力？
```

---

## 6. 测试结果

必须给真实数字，例如：

```text
78 tests
78 pass
0 fail
```

同时说明：

```text
node --check
V1 smoke
V2 integration
```

结果。

---

## 7. 浏览器验收

明确写：

```text
已完成
```

或者：

```text
未完成
```

如果未完成，说明工具失败在哪一层。

不得用 HTTP 可访问代替点击测试。

---

## 8. Git 状态

报告：

```text
当前 branch
HEAD
git status
是否仍有 staged files
是否创建 commit
是否 push
```

---

## 9. 未完成事项

只列与本任务直接相关的剩余问题。

不要把整个未来 roadmap 全部重新展开。

---

## 10. 下一步建议

完成 Day 13 后，只给 1～3 个最合理的下一步候选。

不要自行继续进入 Day 14。

---

# 三十一、最终优先级

如果任务过程中时间、上下文或工具受限，优先保证以下顺序：

```text
P0
1. 不破坏现有仓库和负责人材料
2. 年龄语义定稿
3. production 6 岁觉醒内容
4. 6 岁 → 7 岁年度闭环
5. 原子失败回滚
6. 自动化测试
7. V1 不回归

P1
8. README / context 完善
9. 浏览器真实点击 smoke test

P2
10. 进一步 Git 历史材料整理
```

绝不能为了 P1/P2 导致核心 P0 内容没有完成。

---

# 三十二、本任务最重要的一句话

> 不要继续证明 V2 引擎还能增加多少功能。
>
> 这一次要证明：现有 V2 引擎已经能够真正承载一段《斗罗人生模拟器》的正式游戏人生。

现在开始执行。
