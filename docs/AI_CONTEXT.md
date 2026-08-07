# 项目目标

制作一个斗罗大陆人生模拟器。

# 技术栈

HTML CSS JavaScript

# 核心原则

1. 数据驱动
2. 模块分离
3. 不允许事件硬编码
4. 角色状态偏斗罗履历，不做传统 RPG 四维属性
5. 游戏中的年度活动、剧情决定和结果全部由转盘抽取，不提供传统 RPG 式的手动选项
6. 一年可以连续执行门槛、数量、目录、结果等多个转盘，直到本年流程结束
7. 分支剧情可以保存路线节点并跨年继续
8. 核心目标是模拟魂师成长直至神界，不以家庭、职业和普通生活模拟为主要内容

# 当前架构

## V1

`index.html` 仍是默认可运行入口：

```text
index.html → Game v1 → Player v1 → EventManager → data/events/*.json
```

V1 必须保持独立可运行，不因 V2 开发而被破坏。

## V2

V2 当前已有：

- Player v2 与 v1 → v2 纯迁移适配器；
- Event Schema v2 validator；
- RouteState 与 AnnualSession；
- WheelFlowEngine 最小 runtime；
- V2SessionRunner 年度原子提交；
- 配置驱动的只读派生战力；
- 独立 `v2-demo.html`；
- 连续年度技术垂直切片；
- 第一条 production 游戏内容“6 岁武魂觉醒”。

年度语义采用事务式提交：基于当前年龄执行年度 flow；只有全部成功且 `advance = next_year` 时，V2SessionRunner 才原子提交并将年龄增加一次。失败不留下半提交状态。

V2 尚未切换主入口，也尚未形成完整正式内容库或实现 save/load、battle、ending。

# 当前开发阶段

V2 已从纯技术样机进入正式内容承载阶段。6 岁武魂觉醒能够通过 confirmed production data、确定性 RNG 和现有年度运行时完成 effects、spin、history 与 6 → 7 岁原子提交。

新增 V2 基础设施必须由当前 confirmed 正式内容的真实阻塞证明；不得为了未来可能需要而提前扩展。
