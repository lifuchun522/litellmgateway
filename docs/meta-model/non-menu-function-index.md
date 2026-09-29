# 无菜单功能索引（Non-Menu Function Index）

> 产物语言：zh-CN ｜ 登记所有没有菜单入口、或主要以非交互方式触发的功能。本文件不含 ID 主定义。

本系统的无菜单功能分三类：**HTTP 接口型**（api-only，无页面菜单）、**调度型**（scheduled，由 Quartz 触发）、**启动与切面型**（startup-lifecycle，框架启动或 AOP 织入时生效）。

## FUNC-sys-captcha - 验证码生成

- 触发类型: api-only
- 触发入口: API-captcha-image
- 所属模块: MOD-web
- 为什么无需人工触发: 由 HTTP 请求、调度器或框架切面自动驱动，不存在人工操作页面
- 谁发现失败: 验证码开关关闭时返回说明
- 谁能干预: 无
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md

## FUNC-global-exception - 全局异常统一处理

- 触发类型: startup-lifecycle
- 触发入口: API-global-exception
- 所属模块: MOD-framework
- 为什么无需人工触发: 由 HTTP 请求、调度器或框架切面自动驱动，不存在人工操作页面
- 谁发现失败: 异常处理器自身异常会退化为默认错误页
- 谁能干预: 无
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md

## FUNC-open-gateway-invoke - 开放接口网关调用

- 触发类型: api-only
- 触发入口: API-open-gateway
- 所属模块: MOD-open
- 为什么无需人工触发: 由 HTTP 请求、调度器或框架切面自动驱动，不存在人工操作页面
- 谁发现失败: 凭据缺失/非法、应用停用、接口未授权、上游超时、上游异常
- 谁能干预: 管理员通过应用管理停用问题应用；通过调用日志定位失败原因
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md

## FUNC-open-selftest - 开放平台自检闭环

- 触发类型: api-only
- 触发入口: API-open-selftest-echo
- 所属模块: MOD-open
- 为什么无需人工触发: 由 HTTP 请求、调度器或框架切面自动驱动，不存在人工操作页面
- 谁发现失败: 网关鉴权失败、路由失败、日志未落库
- 谁能干预: 重新执行种子 SQL
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md

## FUNC-job-scheduler - 定时任务调度执行

- 触发类型: scheduled
- 触发入口: JOB-quartz-dispatch
- 所属模块: MOD-quartz
- 为什么无需人工触发: 由 HTTP 请求、调度器或框架切面自动驱动，不存在人工操作页面
- 谁发现失败: 目标方法不存在、执行抛异常、执行超时
- 谁能干预: 通过任务管理暂停并排查
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md

## FUNC-job-log-query - 调度日志查询

- 触发类型: api-only
- 触发入口: API-joblog-list
- 所属模块: MOD-quartz
- 为什么无需人工触发: 由 HTTP 请求、调度器或框架切面自动驱动，不存在人工操作页面
- 谁发现失败: 无
- 谁能干预: 无
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md

## 统计

| 触发类型 | 无菜单功能数 |
|---|---:|
| api-only | 4 |
| startup-lifecycle | 1 |
| scheduled | 1 |

> 说明：本项目中不存在 `@XxlJob`/`@Scheduled`/`@KafkaListener` 等注解式触发器，Quartz 任务通过数据库定义驱动，见 [`source-asset-inventory.md`](./source-asset-inventory.md) 第 4 节。
