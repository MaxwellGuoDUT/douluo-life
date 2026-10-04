# 战力显示与极速推进控制补充验收

日期：2026-10-04（Asia/Shanghai）。唯一实施／服务根：C:/Users/Myosotis/.codex/worktrees/v10-randomness-hotfix/douluo-life。基线043e1fd7e028263cb92aa223ac533e460901b8f6；分支codex/v10-randomness-hotfix。

## 根因与结果

主界面摘要只有修为和实际年龄，档案也没有接战力计算结果。增加总战力字段与档案行：斗一调用已有calculateApkCombatPower及源证据，斗二调用来源App-qyLEl8t4.js导出C.total；与各自战斗条件计算一致，没有新公式、近似值或持久化缓存。斗一未覆盖状态保留typed guard，展示“暂无法计算”与原因提示。

原极速runToTerminal循环虽然每步让出事件循环，但没有停止条件；gameBusy把控制按钮一并禁用。增加UI临时停止请求及事务前shouldStop检查，运行时极速按钮显示“暂停极速”，另显示“取消推进”。两者都结束当前批次并保留已完成抽取；暂停后可继续，继续启动一个最多200次的新批次。取消不清空人生、不回退已提交结果。

读档、新命运、同种子重播、重抽均先停止并等待原批次结束；打开抽屉、更换路线和页面隐藏会请求停止。运行中不接受并发手动或自动推进。终局／typed boundary／错误仍保留原显示和锁定，不被取消提示覆盖。

## 范围与消融

本轮10路径：index.html、css/v10.css、js/v10-app.js、js/v10-display.js、js/v10-human-runner.js、test/v10-randomness.test.js、test/v10-ui-maintenance.test.js、CHANGELOG.md、docs/DEVLOG.md、本文。

战力只按显示需要读取：四种真实开局各35步，与对应既有计算器一致；读取与DOM渲染前后完整snapshot相等，JSON恢复后的战力相等。移除额外战力状态和重复公式的需求，没有修改来源库或生成物。

停止控制只加入一份临时批次请求，不建立第二份会话或历史。真实斗一人类／斗二魂兽批次分别在零步及四步停止，完整snapshot与相同输入的独立逐步运行一致，RNG、历史、phase和最后一次提交前检查点均一致，恢复推进结果一致。UI fixture另验证暂停、取消、并发拒绝、切换／重抽等待、正常批次完成及typed错误。

本轮没有新增性能改善结论；来源战力计算的展示开销未单独测量，上一份长局报告的p95及原设备卡顿限制仍有效。

## 验证证据

- 针对性：node --test test/v10-randomness.test.js test/v10-ui-maintenance.test.js，32/32，退出0。
- 全量：node --test，315总计、314通过、0失败、1跳过，退出0，168836.9901ms。跳过项是默认来源vault缺席时的生成器核对。
- 跳过项补验：显式DOULUO_SOURCE_VAULT=D:/0CODE/douluo-life-source-vault/5ba6453/apk-analysis/E4FB340E，只读运行test/v10-source-inventory.test.js，5/5、0跳过，退出0，生成器--check通过。没有在D:/0CODE/douluo-life实施。
- 静态：修改JS语法、14个本地模块引用、70个唯一HTML ID、资源与现行文档链接、git diff --check通过。
- Browser：正式根入口使用day27-beast-3。初始战力30；一次极速暂停后42/42条记录、50岁、战力608，档案同为608。继续后取消停于78/78、120岁、战力516，显示已取消并保留抽取；再继续完整200批次到278/278，战力121，重抽仍可用。数值随源状态变化，没有把修为直接当战力。
- 390px视口：内容宽375等于页面宽375，无横向溢出；运行时推进栏高100.43、宽351.43，暂停和取消都可点击。随后恢复默认视口。控制台error/warn为空，没有存档写入。
- 本地日志与截图：.tmp/v101/combat-fast-targeted.log、combat-fast-full.log、combat-fast-source.log、combat-fast-preview.jpg，均为本机临时证据，不纳入提交。

实际预览：http://127.0.0.1:8011/；仅loopback，服务根为上述C盘目录。

## 人工检查

1. 刷新预览，在人类或魂兽路线确认摘要和角色档案都有战力，并随抽取／恢复更新。
2. 开始极速，点击暂停极速，再继续；开始极速并取消，确认已完成抽取保留、可以手动推进及重抽。
3. 极速中打开记事／角色，或点击新命运，确认原批次安全停止；窄屏确认控制按钮可用。

负责人于2026-10-04在本聊天反馈“验收通过，写日志并提交GitHub”，本轮人工验收通过，已授权补写日志、提交和推送当前codex/v10-randomness-hotfix分支。量化测试与Browser证据按上述范围记录；提交限定本轮10路径。未操作PR、合并、部署、发布或远端清理。原独立报告、原轨迹／快照／存档、任务书均保留。
