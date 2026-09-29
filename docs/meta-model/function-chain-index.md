# 功能实现主链索引（Function Chain Index）

> 产物语言：zh-CN ｜ 本文件与 [`functional-inventory.md`](./functional-inventory.md) 的 `FUNC-*` 一一对应，不含 ID 主定义。

主链模板：需求面板 → 入口 → Controller/Job → Service → Mapper/子调用 → 对象 → 公共能力 → 物理表 R/C/U/D → 业务结果。

## FUNC-sys-login - 用户登录认证

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-login；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：校验用户凭据与验证码，建立服务端会话并加载其菜单与权限

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /login` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`#login
  - `POST /login` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`#ajaxLogin
  - `GET /unauth` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`#unauth

### Implementation Chain

1. 入口：HTTP `login`
2. 控制器/被调方：`SysLoginController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_user`(R)、`sys_logininfor`(C)
6. 业务结果：登录成功跳转首页；失败返回错误提示并计数

### Object Roles

本功能读写的物理表为 sys_user、sys_logininfor；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证能力（匿名例外）、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_user | 是 | - | - | - | 见 ./database-access-matrix.md |
| sys_logininfor | - | 是 | - | - | 见 ./database-access-matrix.md |

读取表：`sys_user`；

新增表：`sys_logininfor`；

### Rules And State

- 业务规则：验证码由 shiro.user.captchaEnabled/captchaType 控制；密码连续错误次数受 user.password.maxRetryCount=5 限制；status=2 视为停用
- 状态变化：sys_user.login_date/login_ip 更新；sys_logininfor 新增记录；Shiro 会话创建
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 验证码错误、账号不存在、密码错误、账号停用、超过重试上限被锁定
- 人工干预闭环: 管理员在 sys_user 中重置密码或恢复账号状态
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-logout - 用户退出登录

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-logout；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：注销当前会话并释放在线用户记录

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /login` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`#login
  - `POST /login` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`#ajaxLogin
  - `GET /unauth` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`#unauth

### Implementation Chain

1. 入口：HTTP `logout`
2. 控制器/被调方：`SysLoginController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_user_online`(D)、`sys_logininfor`(C)
6. 业务结果：会话失效，跳转登录页

### Object Roles

本功能读写的物理表为 sys_user_online、sys_logininfor；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_user_online | - | - | - | 是 | 见 ./database-access-matrix.md |
| sys_logininfor | - | 是 | - | - | 见 ./database-access-matrix.md |

新增表：`sys_logininfor`；

删除表：`sys_user_online`。

### Rules And State

- 业务规则：登出必须清理 sys_user_online 中对应会话记录
- 状态变化：sys_user_online 删除当前会话行
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 会话已过期时幂等返回登录页
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-captcha - 验证码生成

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-captcha；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：产生算数类型验证码图片并以会话键值绑定答案

### Identity And Entry

- 交互方式: non-interactive
- 触发类型: api-only
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /captcha/captchaImage` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java`#getKaptchaImage
  - `GET /captcha/captchaCode` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java`#captchaCode

### Implementation Chain

1. 入口：HTTP `captchaImage`
2. 控制器/被调方：`SysCaptchaController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：无持久化操作
6. 业务结果：返回 {uuid, img} JSON

### Object Roles

本功能不涉及持久化对象。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证能力（匿名例外）、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| - | - | - | - | - | 本功能无数据库读写 |

### Rules And State

- 业务规则：验证码类型由 shiro.user.captchaType=math 决定；开发期可通过 qvsu.testing.exposeCaptchaCode 暴露答案
- 状态变化：会话中写入验证码答案
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：读接口天然幂等；写接口需按业务键判重

### Closure

- 主链状态: no-persistence（无持久化闭环）
- 失败闭环: 验证码开关关闭时返回说明
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-register - 用户注册

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-register；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：开放自助注册入口创建新用户

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /register` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java`#register
  - `POST /register` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java`#ajaxRegister

### Implementation Chain

1. 入口：HTTP `register`
2. 控制器/被调方：`SysRegisterController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_user`(C)
6. 业务结果：注册成功提示

### Object Roles

本功能读写的物理表为 sys_user；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证能力（匿名例外）、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_user | - | 是 | - | - | 见 ./database-access-matrix.md |

新增表：`sys_user`；

### Rules And State

- 业务规则：登录名唯一；默认分配普通角色
- 状态变化：sys_user 新增一行
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 登录名已存在、验证码错误
- 人工干预闭环: 管理员审核角色分配
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-index - 后台首页与工作台

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-index；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：登录后渲染后台主框架首页

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /index` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#index
  - `GET /lockscreen` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#lockscreen
  - `POST /unlockscreen` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#unlockscreen
  - `GET /system/switchSkin` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#switchSkin
  - `GET /system/menuStyle/{style}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#menuStyle
  - `GET /system/main` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#main

### Implementation Chain

1. 入口：HTTP `index`
2. 控制器/被调方：`SysIndexController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：无持久化操作
6. 业务结果：后台主页面

### Object Roles

本功能不涉及持久化对象。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| - | - | - | - | - | 本功能无数据库读写 |

### Rules And State

- 业务规则：菜单树按当前用户权限过滤
- 状态变化：无持久化变更
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: no-persistence（无持久化闭环）
- 失败闭环: 未登录跳转 /login
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-unauth - 未授权提示页

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-unauth；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：权限不足时给出统一提示

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /index` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#index
  - `GET /lockscreen` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#lockscreen
  - `POST /unlockscreen` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#unlockscreen
  - `GET /system/switchSkin` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#switchSkin
  - `GET /system/menuStyle/{style}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#menuStyle
  - `GET /system/main` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`#main

### Implementation Chain

1. 入口：HTTP `unauth`
2. 控制器/被调方：`SysIndexController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：无持久化操作
6. 业务结果：提示页面

### Object Roles

本功能不涉及持久化对象。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| - | - | - | - | - | 本功能无数据库读写 |

### Rules And State

- 业务规则：由 shiro.user.unauthorizedUrl 指定
- 状态变化：无
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: no-persistence（无持久化闭环）
- 失败闭环: 无
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-profile - 个人中心维护

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-profile；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：用户维护本人资料与密码

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /system/user/profile/checkPassword` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#checkPassword
  - `GET /system/user/profile/resetPwd` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#resetPwd
  - `POST /system/user/profile/resetPwd` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#resetPwd
  - `GET /system/user/profile/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#edit
  - `GET /system/user/profile/avatar` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#avatar
  - `POST /system/user/profile/update` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#update
  - `POST /system/user/profile/updateAvatar` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#updateAvatar

### Implementation Chain

1. 入口：HTTP `system/user/profile`
2. 控制器/被调方：`SysProfileController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_user`(R/U)
6. 业务结果：资料更新成功提示

### Object Roles

本功能读写的物理表为 sys_user；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_user | 是 | - | 是 | - | 见 ./database-access-matrix.md |

读取表：`sys_user`；

更新表：`sys_user`；

### Rules And State

- 业务规则：只能修改本人数据；密码需校验原密码；手机号/邮箱唯一性
- 状态变化：sys_user 对应行更新
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 原密码错误、唯一性冲突、文件类型不合法
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-profile-avatar - 头像上传

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-profile-avatar；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：上传并替换当前用户头像文件

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /system/user/profile/checkPassword` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#checkPassword
  - `GET /system/user/profile/resetPwd` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#resetPwd
  - `POST /system/user/profile/resetPwd` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#resetPwd
  - `GET /system/user/profile/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#edit
  - `GET /system/user/profile/avatar` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#avatar
  - `POST /system/user/profile/update` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#update
  - `POST /system/user/profile/updateAvatar` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`#updateAvatar

### Implementation Chain

1. 入口：HTTP `system/user/profile/avatar`
2. 控制器/被调方：`SysProfileController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_user`(U)
6. 业务结果：返回头像访问 URL

### Object Roles

本功能读写的物理表为 sys_user；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_user | - | - | 是 | - | 见 ./database-access-matrix.md |

更新表：`sys_user`；

### Rules And State

- 业务规则：受 spring.servlet.multipart.max-file-size=10MB 限制；白名单扩展名
- 状态变化：文件系统新增文件；sys_user.avatar 更新
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 文件过大、类型不允许、磁盘写入失败
- 人工干预闭环: 清理 qvsu.profile 目录
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-user-manage - 用户管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-user-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护系统用户账号及其角色、岗位、部门归属

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-user
- 权限码: `system:user:view`
- 端点清单:
  - `POST /system/user/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#list（权限码 `system:user:list`）
  - `POST /system/user/export` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#export（权限码 `system:user:export`）
  - `POST /system/user/importData` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#importData（权限码 `system:user:import`）
  - `GET /system/user/importTemplate` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#importTemplate（权限码 `system:user:view`）
  - `GET /system/user/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#add（权限码 `system:user:add`）
  - `POST /system/user/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#addSave（权限码 `system:user:add`）
  - `GET /system/user/edit/{userId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#edit（权限码 `system:user:edit`）
  - `GET /system/user/view/{userId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#view（权限码 `system:user:list`）
  - `POST /system/user/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#editSave（权限码 `system:user:edit`）
  - `GET /system/user/resetPwd/{userId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#resetPwd（权限码 `system:user:resetPwd`）
  - `POST /system/user/resetPwd` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#resetPwdSave（权限码 `system:user:resetPwd`）
  - `GET /system/user/authRole/{userId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#authRole（权限码 `system:user:edit`）
  - `POST /system/user/authRole/insertAuthRole` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#insertAuthRole（权限码 `system:user:edit`）
  - `POST /system/user/remove` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#remove（权限码 `system:user:remove`）
  - `POST /system/user/checkLoginNameUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#checkLoginNameUnique
  - `POST /system/user/checkPhoneUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#checkPhoneUnique
  - `POST /system/user/checkEmailUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#checkEmailUnique
  - `POST /system/user/changeStatus` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#changeStatus（权限码 `system:user:edit`）
  - `GET /system/user/deptTreeData` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#deptTreeData（权限码 `system:user:list`）
  - `GET /system/user/selectDeptTree/{deptId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`#selectDeptTree（权限码 `system:user:list`）

### Implementation Chain

1. 入口：菜单 MENU-sys-user 对应页面模板
2. 控制器/被调方：`SysUserController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_user`(R/C/U/D)、`sys_user_role`(R/C/D)、`sys_user_post`(R/C/D)、`sys_dept`(R)、`sys_role`(R)、`sys_post`(R)
6. 业务结果：用户列表与增删改结果

### Object Roles

本功能读写的物理表为 sys_user、sys_user_role、sys_user_post、sys_dept、sys_role、sys_post；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_user | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| sys_user_role | 是 | 是 | - | 是 | 见 ./database-access-matrix.md |
| sys_user_post | 是 | 是 | - | 是 | 见 ./database-access-matrix.md |
| sys_dept | 是 | - | - | - | 见 ./database-access-matrix.md |
| sys_role | 是 | - | - | - | 见 ./database-access-matrix.md |
| sys_post | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`sys_user`、`sys_user_role`、`sys_user_post`、`sys_dept`、`sys_role`、`sys_post`；

新增表：`sys_user`、`sys_user_role`、`sys_user_post`；

更新表：`sys_user`；

删除表：`sys_user`、`sys_user_role`、`sys_user_post`。

### Rules And State

- 业务规则：登录名唯一；admin 账号不可删除；逻辑删除用 del_flag；密码经安全工具加盐哈希
- 状态变化：sys_user 及两张关联表读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 登录名重复、无权限、删除超管被拒
- 人工干预闭环: 超管账号问题需 DBA 介入
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-role-manage - 角色管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-role-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护角色、菜单权限与数据范围

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-role
- 权限码: `system:role:view`
- 端点清单:
  - `POST /system/role/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#list（权限码 `system:role:list`）
  - `POST /system/role/export` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#export（权限码 `system:role:export`）
  - `GET /system/role/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#add（权限码 `system:role:add`）
  - `POST /system/role/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#addSave（权限码 `system:role:add`）
  - `GET /system/role/edit/{roleId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#edit（权限码 `system:role:edit`）
  - `POST /system/role/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#editSave（权限码 `system:role:edit`）
  - `GET /system/role/authDataScope/{roleId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#authDataScope
  - `POST /system/role/authDataScope` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#authDataScopeSave（权限码 `system:role:edit`）
  - `POST /system/role/remove` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#remove（权限码 `system:role:remove`）
  - `POST /system/role/checkRoleNameUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#checkRoleNameUnique（权限码 `system:role:remove`）
  - `POST /system/role/checkRoleKeyUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#checkRoleKeyUnique
  - `GET /system/role/selectMenuTree` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#selectMenuTree
  - `POST /system/role/changeStatus` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#changeStatus（权限码 `system:role:edit`）
  - `GET /system/role/authUser/{roleId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#authUser（权限码 `system:role:edit`）
  - `POST /system/role/authUser/allocatedList` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#allocatedList（权限码 `system:role:list`）
  - `POST /system/role/authUser/cancel` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#cancelAuthUser（权限码 `system:role:edit`）
  - `POST /system/role/authUser/cancelAll` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#cancelAuthUserAll（权限码 `system:role:edit`）
  - `GET /system/role/authUser/selectUser/{roleId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#selectUser（权限码 `system:role:list`）
  - `POST /system/role/authUser/unallocatedList` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#unallocatedList（权限码 `system:role:list`）
  - `POST /system/role/authUser/selectAll` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#selectAuthUserAll（权限码 `system:role:edit`）
  - `GET /system/role/deptTreeData` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`#deptTreeData（权限码 `system:role:edit`）

### Implementation Chain

1. 入口：菜单 MENU-sys-role 对应页面模板
2. 控制器/被调方：`SysRoleController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_role`(R/C/U/D)、`sys_role_menu`(R/C/D)、`sys_role_dept`(R/C/D)、`sys_user_role`(R)
6. 业务结果：角色列表与授权结果

### Object Roles

本功能读写的物理表为 sys_role、sys_role_menu、sys_role_dept、sys_user_role；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_role | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| sys_role_menu | 是 | 是 | - | 是 | 见 ./database-access-matrix.md |
| sys_role_dept | 是 | 是 | - | 是 | 见 ./database-access-matrix.md |
| sys_user_role | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`sys_role`、`sys_role_menu`、`sys_role_dept`、`sys_user_role`；

新增表：`sys_role`、`sys_role_menu`、`sys_role_dept`；

更新表：`sys_role`；

删除表：`sys_role`、`sys_role_menu`、`sys_role_dept`。

### Rules And State

- 业务规则：角色名与权限字符唯一；admin 角色不可改；数据范围 1-5 对应全部/自定义/本部门/本部门及以下/仅本人
- 状态变化：sys_role、sys_role_menu、sys_role_dept 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 权限字符重复、删除已分配用户的角色被拒
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-menu-manage - 菜单管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-menu-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护菜单树与按钮权限码，驱动前端路由与后端鉴权

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-menu
- 权限码: `system:menu:view`
- 端点清单:
  - `POST /system/menu/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#list（权限码 `system:menu:list`）
  - `GET /system/menu/remove/{menuId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#remove（权限码 `system:menu:remove`）
  - `GET /system/menu/add/{parentId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#add（权限码 `system:menu:add`）
  - `POST /system/menu/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#addSave（权限码 `system:menu:add`）
  - `GET /system/menu/edit/{menuId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#edit（权限码 `system:menu:edit`）
  - `POST /system/menu/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#editSave（权限码 `system:menu:edit`）
  - `POST /system/menu/updateSort` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#updateSort
  - `GET /system/menu/icon` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#icon
  - `POST /system/menu/checkMenuNameUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#checkMenuNameUnique
  - `GET /system/menu/roleMenuTreeData` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#roleMenuTreeData
  - `GET /system/menu/menuTreeData` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#menuTreeData
  - `GET /system/menu/selectMenuTree/{menuId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`#selectMenuTree

### Implementation Chain

1. 入口：菜单 MENU-sys-menu 对应页面模板
2. 控制器/被调方：`SysMenuController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_menu`(R/C/U/D)、`sys_role_menu`(R)
6. 业务结果：菜单树结构

### Object Roles

本功能读写的物理表为 sys_menu、sys_role_menu；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_menu | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| sys_role_menu | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`sys_menu`、`sys_role_menu`；

新增表：`sys_menu`；

更新表：`sys_menu`；

删除表：`sys_menu`。

### Rules And State

- 业务规则：权限码唯一；存在子菜单或已被角色引用时不可删除；menu_type M/C/F 分别代表目录/菜单/按钮
- 状态变化：sys_menu 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 权限码重复、存在子节点被拒删
- 人工干预闭环: 菜单种子脚本 open_api_menu.sql 与应用内维护存在双写风险
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-dept-manage - 部门管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-dept-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护组织机构树，为数据范围提供层级基础

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-dept
- 权限码: `system:dept:view`
- 端点清单:
  - `POST /system/dept/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#list（权限码 `system:dept:list`）
  - `GET /system/dept/add/{parentId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#add（权限码 `system:dept:add`）
  - `POST /system/dept/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#addSave（权限码 `system:dept:add`）
  - `GET /system/dept/edit/{deptId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#edit（权限码 `system:dept:edit`）
  - `POST /system/dept/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#editSave（权限码 `system:dept:edit`）
  - `GET /system/dept/remove/{deptId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#remove（权限码 `system:dept:remove`）
  - `POST /system/dept/checkDeptNameUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#checkDeptNameUnique
  - `GET /system/dept/selectDeptTree/{deptId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#selectDeptTree（权限码 `system:dept:list`）
  - `GET /system/dept/selectDeptTree/{deptId}/{excludeId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#selectDeptTree（权限码 `system:dept:list`）
  - `GET /system/dept/treeData/{excludeId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`#treeDataExcludeChild（权限码 `system:dept:list`）

### Implementation Chain

1. 入口：菜单 MENU-sys-dept 对应页面模板
2. 控制器/被调方：`SysDeptController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_dept`(R/C/U/D)、`sys_user`(R)
6. 业务结果：部门树

### Object Roles

本功能读写的物理表为 sys_dept、sys_user；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_dept | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| sys_user | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`sys_dept`、`sys_user`；

新增表：`sys_dept`；

更新表：`sys_dept`；

删除表：`sys_dept`。

### Rules And State

- 业务规则：存在下级部门或已分配用户时不可删除；ancestors 字段维护祖先链
- 状态变化：sys_dept 读写，ancestors 级联更新
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 存在子节点或用户被拒删
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-post-manage - 岗位管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-post-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护岗位字典并供用户分配

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-post
- 权限码: `system:post:view`
- 端点清单:
  - `POST /system/post/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#list（权限码 `system:post:list`）
  - `POST /system/post/export` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#export（权限码 `system:post:export`）
  - `POST /system/post/remove` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#remove（权限码 `system:post:remove`）
  - `GET /system/post/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#add（权限码 `system:post:add`）
  - `POST /system/post/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#addSave（权限码 `system:post:add`）
  - `GET /system/post/edit/{postId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#edit（权限码 `system:post:edit`）
  - `POST /system/post/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#editSave（权限码 `system:post:edit`）
  - `POST /system/post/checkPostNameUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#checkPostNameUnique
  - `POST /system/post/checkPostCodeUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`#checkPostCodeUnique

### Implementation Chain

1. 入口：菜单 MENU-sys-post 对应页面模板
2. 控制器/被调方：`SysPostController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_post`(R/C/U/D)、`sys_user_post`(R)
6. 业务结果：岗位列表

### Object Roles

本功能读写的物理表为 sys_post、sys_user_post；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_post | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| sys_user_post | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`sys_post`、`sys_user_post`；

新增表：`sys_post`；

更新表：`sys_post`；

删除表：`sys_post`。

### Rules And State

- 业务规则：岗位编码唯一；已分配用户的岗位不可删除
- 状态变化：sys_post 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 编码重复、被引用拒删
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-dict-manage - 字典管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-dict-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护字典类型与字典数据，支撑下拉框与状态翻译

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-dict
- 权限码: `system:dict:view`
- 端点清单:
  - `POST /system/dict/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#list（权限码 `system:dict:view`）
  - `POST /system/dict/export` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#export（权限码 `system:dict:export`）
  - `GET /system/dict/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#add（权限码 `system:dict:add`）
  - `POST /system/dict/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#addSave（权限码 `system:dict:add`）
  - `GET /system/dict/edit/{dictId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#edit（权限码 `system:dict:edit`）
  - `POST /system/dict/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#editSave（权限码 `system:dict:edit`）
  - `POST /system/dict/remove` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#remove（权限码 `system:dict:remove`）
  - `GET /system/dict/refreshCache` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#refreshCache（权限码 `system:dict:remove`）
  - `GET /system/dict/detail/{dictId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#detail（权限码 `system:dict:list`）
  - `POST /system/dict/checkDictTypeUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#checkDictTypeUnique（权限码 `system:dict:list`）
  - `GET /system/dict/selectDictTree/{columnId}/{dictType}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#selectDictTree
  - `GET /system/dict/treeData` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`#treeData

### Implementation Chain

1. 入口：菜单 MENU-sys-dict 对应页面模板
2. 控制器/被调方：`SysDictTypeController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_dict_type`(R/C/U/D)、`sys_dict_data`(R/C/U/D)
6. 业务结果：字典类型与数据列表

### Object Roles

本功能读写的物理表为 sys_dict_type、sys_dict_data；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_dict_type | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| sys_dict_data | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |

读取表：`sys_dict_type`、`sys_dict_data`；

新增表：`sys_dict_type`、`sys_dict_data`；

更新表：`sys_dict_type`、`sys_dict_data`；

删除表：`sys_dict_type`、`sys_dict_data`。

### Rules And State

- 业务规则：字典类型 type 唯一；字典数据按 dict_sort 排序；修改后需刷新缓存
- 状态变化：sys_dict_type、sys_dict_data 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 类型重复、缓存未刷新导致前端仍显示旧值
- 人工干预闭环: 可调用刷新缓存接口
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-config-manage - 参数设置

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-config-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护运行期可改的键值参数

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-config
- 权限码: `system:config:view`
- 端点清单:
  - `POST /system/config/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#list（权限码 `system:config:list`）
  - `POST /system/config/export` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#export（权限码 `system:config:export`）
  - `GET /system/config/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#add（权限码 `system:config:add`）
  - `POST /system/config/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#addSave（权限码 `system:config:add`）
  - `GET /system/config/edit/{configId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#edit（权限码 `system:config:edit`）
  - `POST /system/config/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#editSave（权限码 `system:config:edit`）
  - `POST /system/config/remove` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#remove（权限码 `system:config:remove`）
  - `GET /system/config/refreshCache` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#refreshCache（权限码 `system:config:remove`）
  - `POST /system/config/checkConfigKeyUnique` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`#checkConfigKeyUnique（权限码 `system:config:remove`）

### Implementation Chain

1. 入口：菜单 MENU-sys-config 对应页面模板
2. 控制器/被调方：`SysConfigController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_config`(R/C/U/D)
6. 业务结果：参数列表

### Object Roles

本功能读写的物理表为 sys_config；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_config | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |

读取表：`sys_config`；

新增表：`sys_config`；

更新表：`sys_config`；

删除表：`sys_config`。

### Rules And State

- 业务规则：参数键 config_key 唯一；内置参数不可删除；修改需刷新缓存
- 状态变化：sys_config 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 键重复、内置参数拒删
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-sys-notice-manage - 通知公告

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-sys-notice-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：发布与维护站内通知公告

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-sys-notice
- 权限码: `system:notice:view`
- 端点清单:
  - `POST /system/notice/list` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`#list（权限码 `system:notice:list`）
  - `GET /system/notice/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`#add（权限码 `system:notice:add`）
  - `POST /system/notice/add` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`#addSave（权限码 `system:notice:add`）
  - `GET /system/notice/edit/{noticeId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`#edit（权限码 `system:notice:edit`）
  - `POST /system/notice/edit` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`#editSave（权限码 `system:notice:edit`）
  - `GET /system/notice/view/{noticeId}` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`#view（权限码 `system:notice:list`）
  - `POST /system/notice/remove` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`#remove（权限码 `system:notice:remove`）

### Implementation Chain

1. 入口：菜单 MENU-sys-notice 对应页面模板
2. 控制器/被调方：`SysNoticeController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_notice`(R/C/U/D)
6. 业务结果：公告列表与前台展示

### Object Roles

本功能读写的物理表为 sys_notice；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_notice | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |

读取表：`sys_notice`；

新增表：`sys_notice`；

更新表：`sys_notice`；

删除表：`sys_notice`。

### Rules And State

- 业务规则：notice_type 区分通知与公告；status 控制是否展示
- 状态变化：sys_notice 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 无权限、内容超长
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-common-upload - 通用文件上传

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-common-upload；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：为各业务页面提供统一文件上传入口

### Identity And Entry

- 交互方式: interactive
- 触发类型: api-only
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /common/download` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#fileDownload
  - `POST /common/upload` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#uploadFile
  - `POST /common/uploads` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#uploadFiles
  - `GET /common/download/resource` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#resourceDownload

### Implementation Chain

1. 入口：HTTP `common/upload`
2. 控制器/被调方：`CommonController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：无持久化操作
6. 业务结果：文件 URL

### Object Roles

本功能不涉及持久化对象。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| - | - | - | - | - | 本功能无数据库读写 |

### Rules And State

- 业务规则：受 max-file-size 限制；扩展名白名单；文件名重命名防穿越
- 状态变化：文件系统写入
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：读接口天然幂等；写接口需按业务键判重

### Closure

- 主链状态: no-persistence（无持久化闭环）
- 失败闭环: 超限、类型不允许
- 人工干预闭环: 清理上传目录
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-common-download - 通用文件下载与资源读取

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-common-download；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：按受控路径下载文件与读取本地资源

### Identity And Entry

- 交互方式: interactive
- 触发类型: api-only
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /common/download` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#fileDownload
  - `POST /common/upload` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#uploadFile
  - `POST /common/uploads` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#uploadFiles
  - `GET /common/download/resource` → `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`#resourceDownload

### Implementation Chain

1. 入口：HTTP `common/download`
2. 控制器/被调方：`CommonController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：无持久化操作
6. 业务结果：文件流

### Object Roles

本功能不涉及持久化对象。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| - | - | - | - | - | 本功能无数据库读写 |

### Rules And State

- 业务规则：必须校验路径在允许目录内，防目录穿越
- 状态变化：无
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：读接口天然幂等；写接口需按业务键判重

### Closure

- 主链状态: no-persistence（无持久化闭环）
- 失败闭环: 文件不存在、路径非法
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-global-exception - 全局异常统一处理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-global-exception；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：把各类异常统一转换为 AjaxResult 响应，避免堆栈外泄

### Identity And Entry

- 交互方式: non-interactive
- 触发类型: startup-lifecycle
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - 无 HTTP 端点（系统内部调用或调度触发）

### Implementation Chain

1. 入口：系统内部调用
2. 控制器/被调方：`GlobalExceptionHandler`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：无持久化操作
6. 业务结果：统一错误响应体

### Object Roles

本功能不涉及持久化对象。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| - | - | - | - | - | 本功能无数据库读写 |

### Rules And State

- 业务规则：业务异常返回 code=500 与中文提示；权限异常转 403；未捕获异常记录日志
- 状态变化：无持久化
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: no-persistence（无持久化闭环）
- 失败闭环: 异常处理器自身异常会退化为默认错误页
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-open-app-manage - 应用管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-open-app-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：维护接入开放平台的第三方应用及其密钥与状态

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-open-app
- 权限码: `open:app:view`
- 端点清单:
  - `POST /admin/open/app/list` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`#list
  - `GET /admin/open/app/add` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`#add
  - `POST /admin/open/app/add` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`#addSave
  - `GET /admin/open/app/edit/{id}` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`#edit
  - `POST /admin/open/app/edit` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`#editSave
  - `POST /admin/open/app/remove` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`#remove
  - `POST /admin/open/app/resetSecret` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`#resetSecret

### Implementation Chain

1. 入口：菜单 MENU-open-app 对应页面模板
2. 控制器/被调方：`OpenAppController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`open_app`(R/C/U/D)、`open_app_api`(R/C/D)、`open_api`(R)
6. 业务结果：应用列表与授权关系

### Object Roles

本功能读写的物理表为 open_app、open_app_api、open_api；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| open_app | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| open_app_api | 是 | 是 | - | 是 | 见 ./database-access-matrix.md |
| open_api | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`open_app`、`open_app_api`、`open_api`；

新增表：`open_app`、`open_app_api`；

更新表：`open_app`；

删除表：`open_app`、`open_app_api`。

### Rules And State

- 业务规则：应用标识唯一；密钥由服务端生成；停用应用后其全部调用应被拒
- 状态变化：open_app 与 open_app_api 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 标识重复、删除仍被授权引用的应用被拒
- 人工干预闭环: 密钥泄露需在应用管理中重置
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-open-api-manage - 接口管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-open-api-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：登记对外开放的接口定义，供应用授权与文档生成

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-open-api
- 权限码: `open:api:view`
- 端点清单:
  - `POST /admin/open/api/list` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`#list
  - `GET /admin/open/api/curl/{id}` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`#curl
  - `GET /admin/open/api/add` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`#add
  - `POST /admin/open/api/add` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`#addSave
  - `GET /admin/open/api/edit/{id}` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`#edit
  - `POST /admin/open/api/edit` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`#editSave
  - `POST /admin/open/api/remove` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`#remove

### Implementation Chain

1. 入口：菜单 MENU-open-api 对应页面模板
2. 控制器/被调方：`OpenApiMgrController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`open_api`(R/C/U/D)、`open_app_api`(R)、`open_api_doc`(R)
6. 业务结果：接口定义列表

### Object Roles

本功能读写的物理表为 open_api、open_app_api、open_api_doc；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| open_api | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| open_app_api | 是 | - | - | - | 见 ./database-access-matrix.md |
| open_api_doc | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`open_api`、`open_app_api`、`open_api_doc`；

新增表：`open_api`；

更新表：`open_api`；

删除表：`open_api`。

### Rules And State

- 业务规则：接口编码唯一；接口须归属某个上游服务；删除前须解除应用授权
- 状态变化：open_api 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 编码重复、被授权引用拒删
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-open-auth-manage - 授权管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-open-auth-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：把接口授权给应用，形成可调用集合

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-open-auth
- 权限码: `open:auth:view`
- 端点清单:
  - `GET /admin/open/auth/apps` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java`#apps
  - `GET /admin/open/auth/apis` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java`#apis
  - `GET /admin/open/auth/apiIds` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java`#apiIds
  - `POST /admin/open/auth/save` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java`#save

### Implementation Chain

1. 入口：菜单 MENU-open-auth 对应页面模板
2. 控制器/被调方：`OpenAuthController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`open_app_api`(R/C/U/D)、`open_app`(R)、`open_api`(R)
6. 业务结果：授权关系矩阵

### Object Roles

本功能读写的物理表为 open_app_api、open_app、open_api；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| open_app_api | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| open_app | 是 | - | - | - | 见 ./database-access-matrix.md |
| open_api | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`open_app_api`、`open_app`、`open_api`；

新增表：`open_app_api`；

更新表：`open_app_api`；

删除表：`open_app_api`。

### Rules And State

- 业务规则：授权为应用与接口的多对多关系，重复授权应幂等；未授权接口调用必须被拒
- 状态变化：open_app_api 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 应用或接口不存在、重复授权
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-open-log-query - 调用日志查询

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-open-log-query；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：按应用/接口/时间/结果查询开放接口调用流水

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-open-log
- 权限码: `open:log:view`
- 端点清单:
  - `POST /admin/open/log/list` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java`#list
  - `GET /admin/open/log/stats` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java`#stats
  - `GET /admin/open/log/exportCsv` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java`#exportCsv

### Implementation Chain

1. 入口：菜单 MENU-open-log 对应页面模板
2. 控制器/被调方：`OpenLogController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`open_call_log`(R)
6. 业务结果：调用日志列表与详情

### Object Roles

本功能读写的物理表为 open_call_log；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力、调用日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| open_call_log | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`open_call_log`；

### Rules And State

- 业务规则：日志只读；分页查询；敏感请求头需脱敏展示
- 状态变化：open_call_log 只读
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 无
- 人工干预闭环: 归档需 DBA 处理
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-open-doc-manage - 文档管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-open-doc-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：为已登记接口维护对外文档内容

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-open-doc
- 权限码: `open:doc:view`
- 端点清单:
  - `GET /admin/open/doc/apis` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java`#apis
  - `GET /admin/open/doc/html/{apiId}` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java`#html
  - `GET /admin/open/doc/list` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java`#list
  - `POST /admin/open/doc/generate` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java`#generate
  - `GET /admin/open/doc/download` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java`#download

### Implementation Chain

1. 入口：菜单 MENU-open-doc 对应页面模板
2. 控制器/被调方：`OpenDocController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`open_api_doc`(R/C/U/D)、`open_api`(R)
6. 业务结果：接口文档

### Object Roles

本功能读写的物理表为 open_api_doc、open_api；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| open_api_doc | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |
| open_api | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`open_api_doc`、`open_api`；

新增表：`open_api_doc`；

更新表：`open_api_doc`；

删除表：`open_api_doc`。

### Rules And State

- 业务规则：一个接口可有版本化文档；文档内容支持富文本
- 状态变化：open_api_doc 读写
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 关联接口不存在
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-open-gateway-invoke - 开放接口网关调用

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-open-gateway-invoke；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：对外部调用方提供统一入口：鉴权 → 路由 → 转发 → 记录调用日志 → 返回

### Identity And Entry

- 交互方式: non-interactive
- 触发类型: api-only
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - 无 HTTP 端点（系统内部调用或调度触发）

### Implementation Chain

1. 入口：HTTP `open`
2. 控制器/被调方：`OpenGatewayController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`open_app`(R)、`open_api`(R)、`open_app_api`(R)、`open_call_log`(C)
6. 业务结果：上游业务响应 + 调用日志记录

### Object Roles

本功能读写的物理表为 open_app、open_api、open_app_api、open_call_log；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力、调用日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| open_app | 是 | - | - | - | 见 ./database-access-matrix.md |
| open_api | 是 | - | - | - | 见 ./database-access-matrix.md |
| open_app_api | 是 | - | - | - | 见 ./database-access-matrix.md |
| open_call_log | - | 是 | - | - | 见 ./database-access-matrix.md |

读取表：`open_app`、`open_api`、`open_app_api`；

新增表：`open_call_log`；

### Rules And State

- 业务规则：未授权接口必须拒绝；应用停用必须拒绝；调用全过程须留痕；日志需记录请求头与耗时
- 状态变化：open_call_log 新增；不修改应用与接口定义
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：读接口天然幂等；写接口需按业务键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 凭据缺失/非法、应用停用、接口未授权、上游超时、上游异常
- 人工干预闭环: 管理员通过应用管理停用问题应用；通过调用日志定位失败原因
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-open-selftest - 开放平台自检闭环

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-open-selftest；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：内置 httpbin 风格的被调端与自检种子，验证网关链路是否可用

### Identity And Entry

- 交互方式: non-interactive
- 触发类型: api-only
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - `GET /selftest/httpbin/get` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#get
  - `POST /selftest/httpbin/post` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#post
  - `PUT /selftest/httpbin/put` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#put
  - `DELETE /selftest/httpbin/delete` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#delete
  - `GET /selftest/httpbin/headers` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#headers
  - `GET /selftest/httpbin/ip` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#ip
  - `GET /selftest/httpbin/user-agent` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#userAgent
  - `GET /selftest/httpbin/uuid` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#uuid
  - `GET /selftest/httpbin/timeout` → `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java`#timeout

### Implementation Chain

1. 入口：HTTP `open/selftest`
2. 控制器/被调方：`OpenSelftestHttpbinController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`open_app`(C)、`open_api`(C)、`open_app_api`(C)、`open_call_log`(R)
6. 业务结果：自检结果与调用日志

### Object Roles

本功能读写的物理表为 open_app、open_api、open_app_api、open_call_log；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力、调用日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| open_app | - | 是 | - | - | 见 ./database-access-matrix.md |
| open_api | - | 是 | - | - | 见 ./database-access-matrix.md |
| open_app_api | - | 是 | - | - | 见 ./database-access-matrix.md |
| open_call_log | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`open_call_log`；

新增表：`open_app`、`open_api`、`open_app_api`；

### Rules And State

- 业务规则：自检端点仅用于验证，生产环境需评估是否暴露
- 状态变化：种子数据写入；open_call_log 读取校验
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：读接口天然幂等；写接口需按业务键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 网关鉴权失败、路由失败、日志未落库
- 人工干预闭环: 重新执行种子 SQL
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-job-manage - 定时任务管理

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-job-manage；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：定义、启停、立即执行 Quartz 定时任务

### Identity And Entry

- 交互方式: interactive
- 触发类型: menu
- 菜单入口: MENU-job-manage
- 权限码: `monitor:job:view`
- 端点清单:
  - `POST /monitor/job/list` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#list（权限码 `monitor:job:list`）
  - `POST /monitor/job/export` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#export（权限码 `monitor:job:export`）
  - `POST /monitor/job/remove` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#remove（权限码 `monitor:job:remove`）
  - `GET /monitor/job/detail/{jobId}` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#detail（权限码 `monitor:job:detail`）
  - `POST /monitor/job/changeStatus` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#changeStatus（权限码 `monitor:job:changeStatus`）
  - `POST /monitor/job/run` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#run（权限码 `monitor:job:changeStatus`）
  - `GET /monitor/job/add` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#add（权限码 `monitor:job:add`）
  - `POST /monitor/job/add` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#addSave（权限码 `monitor:job:add`）
  - `GET /monitor/job/edit/{jobId}` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#edit（权限码 `monitor:job:edit`）
  - `POST /monitor/job/edit` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#editSave（权限码 `monitor:job:edit`）
  - `POST /monitor/job/checkCronExpressionIsValid` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#checkCronExpressionIsValid
  - `GET /monitor/job/cron` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#cron
  - `GET /monitor/job/queryCronExpression` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`#queryCronExpression

### Implementation Chain

1. 入口：菜单 MENU-job-manage 对应页面模板
2. 控制器/被调方：`SysJobController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_job`(R/C/U/D)
6. 业务结果：任务列表与执行结果

### Object Roles

本功能读写的物理表为 sys_job；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_job | 是 | 是 | 是 | 是 | 见 ./database-access-matrix.md |

读取表：`sys_job`；

新增表：`sys_job`；

更新表：`sys_job`；

删除表：`sys_job`。

### Rules And State

- 业务规则：Cron 表达式合法性校验；调用目标白名单校验；任务名唯一
- 状态变化：sys_job 读写；Quartz 调度器注册/移除
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: Cron 非法、调用目标黑名单被拒、执行异常
- 人工干预闭环: 暂停问题任务
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-job-scheduler - 定时任务调度执行

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-job-scheduler；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：按 Cron 触发任务并记录执行日志

### Identity And Entry

- 交互方式: non-interactive
- 触发类型: scheduled
- 菜单入口: none
- 权限码: 无（匿名或系统内部）
- 端点清单:
  - 无 HTTP 端点（系统内部调用或调度触发）

### Implementation Chain

1. 入口：系统内部调用
2. 控制器/被调方：`SysJobServiceImpl`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_job`(R/U)、`sys_job_log`(C)、`QRTZ_TRIGGERS`(R)、`QRTZ_JOB_DETAILS`(R)
6. 业务结果：任务执行结果与日志

### Object Roles

本功能读写的物理表为 sys_job、sys_job_log、QRTZ_TRIGGERS、QRTZ_JOB_DETAILS；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid、Quartz
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_job | 是 | - | 是 | - | 见 ./database-access-matrix.md |
| sys_job_log | - | 是 | - | - | 见 ./database-access-matrix.md |
| QRTZ_TRIGGERS | 是 | - | - | - | 见 ./database-access-matrix.md |
| QRTZ_JOB_DETAILS | 是 | - | - | - | 见 ./database-access-matrix.md |

读取表：`sys_job`、`QRTZ_TRIGGERS`、`QRTZ_JOB_DETAILS`；

新增表：`sys_job_log`；

更新表：`sys_job`；

### Rules And State

- 业务规则：并发执行策略受 concurrent 标志控制；异常不中断调度器
- 状态变化：sys_job_log 新增；sys_job 执行信息更新
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：按业务主键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 目标方法不存在、执行抛异常、执行超时
- 人工干预闭环: 通过任务管理暂停并排查
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断

## FUNC-job-log-query - 调度日志查询

### Requirement Link

对应需求面板见 [`business-function-requirements.md`](./business-function-requirements.md) 中的 FUNC-job-log-query；功能主定义见 [`functional-inventory.md`](./functional-inventory.md)。独立业务结果：查询与清理定时任务执行日志

### Identity And Entry

- 交互方式: non-interactive
- 触发类型: api-only
- 菜单入口: MENU-job-manage
- 权限码: `monitor:job:view`
- 端点清单:
  - `POST /monitor/jobLog/list` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`#list（权限码 `monitor:job:list`）
  - `POST /monitor/jobLog/export` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`#export（权限码 `monitor:job:export`）
  - `POST /monitor/jobLog/remove` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`#remove（权限码 `monitor:job:remove`）
  - `GET /monitor/jobLog/detail/{jobLogId}` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`#detail（权限码 `monitor:job:detail`）
  - `POST /monitor/jobLog/clean` → `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`#clean（权限码 `monitor:job:remove`）

### Implementation Chain

1. 入口：菜单 MENU-job-manage 对应页面模板
2. 控制器/被调方：`SysJobLogController`
3. 业务服务：同模块 `service` / `service.impl` 包中的对应 Service 实现
4. 数据访问：同模块 `mapper` 包中的 Mapper 接口与 `resources/mapper` 下的 XML
5. 物理表操作：`sys_job_log`(R/D)
6. 业务结果：调度日志列表

### Object Roles

本功能读写的物理表为 sys_job_log；对应实体对象见 [`domain-model.md`](./domain-model.md)，表主定义见 [`database-model.md`](./database-model.md)，字段设计见 [`database-schema.md`](./database-schema.md)。

### Technical And Common Dependencies

- 依赖的公共能力见 [`common-capability-index.md`](./common-capability-index.md)：认证与权限校验、审计日志能力
- 依赖的技术组件见 [`technical-component-index.md`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid
- 依赖的配置见 [`config-index.md`](./config-index.md)。

### Physical Data Operations

| 物理表 | R | C | U | D | 说明 |
|---|---|---|---|---|---|
| sys_job_log | 是 | - | - | 是 | 见 ./database-access-matrix.md |

读取表：`sys_job_log`；

删除表：`sys_job_log`。

### Rules And State

- 业务规则：日志只读，仅允许删除与清空
- 状态变化：sys_job_log 读取删除
- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。
- 幂等性：读接口天然幂等；写接口需按业务键判重

### Closure

- 主链状态: closed（入口→控制器→服务→Mapper→物理表→结果已贯通）
- 失败闭环: 无
- 人工干预闭环: 无
- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断
