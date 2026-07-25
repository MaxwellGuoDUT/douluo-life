# 项目目标

制作一个斗罗大陆人生模拟器。

# 技术栈

HTML CSS JavaScript

# 核心原则

1. 数据驱动
2. 模块分离
3. 不允许事件硬编码

# 当前架构

Player:
负责状态，是人生模拟的状态容器

Game:
负责流程

EventManager:
负责事件选择

Effects:
负责修改状态

# Player State v1.0

当前 Player 包含：

age
hp
power
agility
intelligence
luck
spirit
academy
soulPower
soulRingCount
rank
title
faction
money
reputation
