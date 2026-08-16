# APK `setStoryBranch` 静态审计与运行时接入记录（2026-08-16）

状态：`source_proven_connected / scheduler_action_unresolved`

## 来源证据

本阶段只审计 APK 解包后的静态源码，没有启动 APK，也没有调用原始游戏运行时。

| 来源 | 直接证据 |
| --- | --- |
| `App-qyLEl8t4.js` | effect switch 对 `setStoryBranch` 的处理：`storyBranch = effect.branch`，`branchStartTimelineAge = timelineAge`；schema 将分支限定为 `1/2/3` |
| `douluo1-pack-C6xEgEus.js` | faction 规则 `Oi` 为 `218e21 → 2`、`7d7144 → 1`、`f7c0c9 → 2`、`a7565e → 1`，未登记项默认 `3` |
| `douluo2-pack-BsEUb2l9.js` | 十二岁势力规则中保留来源明确的 `branch: 1` effect |

## 运行时处理

`js/apk-rule-runtime.js` 已将 `setStoryBranch` 登记为 source runtime effect，并执行：

1. 严格接受整数分支 `1/2/3`；
2. 写入独立 APK character 的 `storyBranch`；
3. 把提交时的 `timelineAge` 原样写入 `branchStartTimelineAge`；
4. 继续使用 effect batch 的 clone/rollback 机制，不修改输入状态。

本阶段没有把该字段强行映射到 Player v2。APK 独立 character 已有同名字段和对应初始化值，直接保留来源语义更准确；Player v2 bridge 仍按后续路线逐项处理。

## 验证

- typed effect 测试覆盖 branch 写入、时间线起点和非法分支回滚；
- 真实 `douluo1` faction option `218e21` 已从 `UNSUPPORTED_APK_EFFECT` 推进到 `douluo1:flow.formal-human.scheduler`；
- `storyBranch = 2`、`formal:faction-6-chosen = true` 和 `formal:faction-locked = true` 均保持 APK 来源结果；
- 全量回归：196/196 通过。

## 当前边界

真实 smoke 路线下一处是：

```text
flow:   douluo1:flow.formal-human.scheduler
action: douluo1:action.formal-human.schedule
status: APK_ROUTE_DYNAMIC_UNRESOLVED
```

该动态 action 的年度调度、神考、领域和终局优先级尚未完成来源审计，暂不根据 action 名称猜测目标。
