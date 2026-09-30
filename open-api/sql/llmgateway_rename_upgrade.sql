-- 第 02 境换骨：定时任务调用目标的方法名去掉旧 qvsu 前缀。
--
-- 背景：sys_job.invoke_target 存的是「Bean 名.方法名」字符串，Bean 名在兼容期内保持 qvsuTask
-- （见 LlmGatewayTask 的 @Component 注释），但方法名已随换骨改为 params / noParams / multipleParams。
-- 不改这里，已存在的定时任务会在下一轮调度时抛「找不到目标」。
--
-- 幂等：可重复执行；已是新写法时不受影响。
-- 反向回滚：把 new 与 old 的位置对调再执行一次。

update sys_job
   set invoke_target = replace(invoke_target, 'qvsuTask.qvsuNoParams', 'qvsuTask.noParams')
 where invoke_target like 'qvsuTask.qvsuNoParams%';

update sys_job
   set invoke_target = replace(invoke_target, 'qvsuTask.qvsuMultipleParams', 'qvsuTask.multipleParams')
 where invoke_target like 'qvsuTask.qvsuMultipleParams%';

update sys_job
   set invoke_target = replace(invoke_target, 'qvsuTask.qvsuParams', 'qvsuTask.params')
 where invoke_target like 'qvsuTask.qvsuParams%';
