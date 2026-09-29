# 功能清单（Functional Inventory）

> 产物语言：zh-CN ｜ 本文件是全部 `FUNC-*` 稳定 ID 的**唯一主定义位置**。

共 29 个功能。每个功能在 [`business-function-requirements.md`](./business-function-requirements.md) 有需求面板，在 [`function-chain-index.md`](./function-chain-index.md) 有实现主链，三者一一对应。

## 0. 功能总览

| 功能 ID | 名称 | 类型 | 交互方式 | 触发类型 | 优先级 | 所属域 | 所属模块 | 菜单入口 |
|---|---|---|---|---|---|---|---|---|
| FUNC-sys-login | 用户登录认证 | platform | interactive | menu | core | DOM-system | MOD-web | none |
| FUNC-sys-logout | 用户退出登录 | platform | interactive | menu | core | DOM-system | MOD-web | none |
| FUNC-sys-captcha | 验证码生成 | platform | non-interactive | api-only | important | DOM-system | MOD-web | none |
| FUNC-sys-register | 用户注册 | platform | interactive | menu | supporting | DOM-system | MOD-web | none |
| FUNC-sys-index | 后台首页与工作台 | platform | interactive | menu | supporting | DOM-system | MOD-web | none |
| FUNC-sys-unauth | 未授权提示页 | platform | interactive | menu | edge | DOM-system | MOD-web | none |
| FUNC-sys-profile | 个人中心维护 | platform | interactive | menu | important | DOM-system | MOD-web | none |
| FUNC-sys-profile-avatar | 头像上传 | platform | interactive | menu | supporting | DOM-system | MOD-web | none |
| FUNC-sys-user-manage | 用户管理 | platform | interactive | menu | core | DOM-system | MOD-system | MENU-sys-user |
| FUNC-sys-role-manage | 角色管理 | platform | interactive | menu | core | DOM-system | MOD-system | MENU-sys-role |
| FUNC-sys-menu-manage | 菜单管理 | platform | interactive | menu | core | DOM-system | MOD-system | MENU-sys-menu |
| FUNC-sys-dept-manage | 部门管理 | platform | interactive | menu | important | DOM-system | MOD-system | MENU-sys-dept |
| FUNC-sys-post-manage | 岗位管理 | platform | interactive | menu | supporting | DOM-system | MOD-system | MENU-sys-post |
| FUNC-sys-dict-manage | 字典管理 | platform | interactive | menu | important | DOM-system | MOD-system | MENU-sys-dict |
| FUNC-sys-config-manage | 参数设置 | platform | interactive | menu | important | DOM-system | MOD-system | MENU-sys-config |
| FUNC-sys-notice-manage | 通知公告 | platform | interactive | menu | supporting | DOM-system | MOD-system | MENU-sys-notice |
| FUNC-common-upload | 通用文件上传 | common-entry | interactive | api-only | supporting | DOM-common | MOD-web | none |
| FUNC-common-download | 通用文件下载与资源读取 | common-entry | interactive | api-only | supporting | DOM-common | MOD-web | none |
| FUNC-global-exception | 全局异常统一处理 | common-entry | non-interactive | startup-lifecycle | important | DOM-common | MOD-framework | none |
| FUNC-open-app-manage | 应用管理 | business | interactive | menu | core | DOM-open | MOD-open | MENU-open-app |
| FUNC-open-api-manage | 接口管理 | business | interactive | menu | core | DOM-open | MOD-open | MENU-open-api |
| FUNC-open-auth-manage | 授权管理 | business | interactive | menu | core | DOM-open | MOD-open | MENU-open-auth |
| FUNC-open-log-query | 调用日志查询 | business | interactive | menu | important | DOM-open | MOD-open | MENU-open-log |
| FUNC-open-doc-manage | 文档管理 | business | interactive | menu | important | DOM-open | MOD-open | MENU-open-doc |
| FUNC-open-gateway-invoke | 开放接口网关调用 | business | non-interactive | api-only | core | DOM-open | MOD-open | none |
| FUNC-open-selftest | 开放平台自检闭环 | business | non-interactive | api-only | supporting | DOM-open | MOD-open | none |
| FUNC-job-manage | 定时任务管理 | platform | interactive | menu | important | DOM-quartz | MOD-quartz | MENU-job-manage |
| FUNC-job-scheduler | 定时任务调度执行 | platform | non-interactive | scheduled | core | DOM-quartz | MOD-quartz | none |
| FUNC-job-log-query | 调度日志查询 | operations | non-interactive | api-only | supporting | DOM-quartz | MOD-quartz | MENU-job-manage |

## FUNC-sys-login - 用户登录认证

- ID: FUNC-sys-login
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: Controller SysLoginController
- 独立业务结果: 校验用户凭据与验证码，建立服务端会话并加载其菜单与权限
- 功能边界: 开始=用户已存在于 sys_user 且 status=0，账号未被锁定 / 结束=登录成功跳转首页；失败返回错误提示并计数 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-logout - 用户退出登录

- ID: FUNC-sys-logout
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: Controller SysLoginController
- 独立业务结果: 注销当前会话并释放在线用户记录
- 功能边界: 开始=存在有效会话 / 结束=会话失效，跳转登录页 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-captcha - 验证码生成

- ID: FUNC-sys-captcha
- 类型: platform
- 交互方式: non-interactive
- 触发类型: api-only
- 优先级: important
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: API-captcha-image
- 独立业务结果: 产生算数类型验证码图片并以会话键值绑定答案
- 功能边界: 开始=shiro.user.captchaEnabled=true 时启用 / 结束=返回 {uuid, img} JSON / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: no-persistence
- 详细逆向: completed

## FUNC-sys-register - 用户注册

- ID: FUNC-sys-register
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: supporting
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: Controller SysRegisterController
- 独立业务结果: 开放自助注册入口创建新用户
- 功能边界: 开始=系统允许注册 / 结束=注册成功提示 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-index - 后台首页与工作台

- ID: FUNC-sys-index
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: supporting
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: Controller SysIndexController
- 独立业务结果: 登录后渲染后台主框架首页
- 功能边界: 开始=会话有效 / 结束=后台主页面 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: no-persistence
- 详细逆向: completed

## FUNC-sys-unauth - 未授权提示页

- ID: FUNC-sys-unauth
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: edge
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: Controller SysIndexController
- 独立业务结果: 权限不足时给出统一提示
- 功能边界: 开始=访问了无权限资源 / 结束=提示页面 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: no-persistence
- 详细逆向: completed

## FUNC-sys-profile - 个人中心维护

- ID: FUNC-sys-profile
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: important
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: Controller SysProfileController
- 独立业务结果: 用户维护本人资料与密码
- 功能边界: 开始=会话有效 / 结束=资料更新成功提示 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-profile-avatar - 头像上传

- ID: FUNC-sys-profile-avatar
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: supporting
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: Controller SysProfileController
- 独立业务结果: 上传并替换当前用户头像文件
- 功能边界: 开始=会话有效 / 结束=返回头像访问 URL / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-user-manage - 用户管理

- ID: FUNC-sys-user-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-user
- 其他入口: Controller SysUserController
- 独立业务结果: 维护系统用户账号及其角色、岗位、部门归属
- 功能边界: 开始=拥有 system:user:* 权限码 / 结束=用户列表与增删改结果 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-role-manage - 角色管理

- ID: FUNC-sys-role-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-role
- 其他入口: Controller SysRoleController
- 独立业务结果: 维护角色、菜单权限与数据范围
- 功能边界: 开始=拥有 system:role:* 权限码 / 结束=角色列表与授权结果 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-menu-manage - 菜单管理

- ID: FUNC-sys-menu-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-menu
- 其他入口: Controller SysMenuController
- 独立业务结果: 维护菜单树与按钮权限码，驱动前端路由与后端鉴权
- 功能边界: 开始=拥有 system:menu:* 权限码 / 结束=菜单树结构 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-dept-manage - 部门管理

- ID: FUNC-sys-dept-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: important
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-dept
- 其他入口: Controller SysDeptController
- 独立业务结果: 维护组织机构树，为数据范围提供层级基础
- 功能边界: 开始=拥有 system:dept:* 权限码 / 结束=部门树 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-post-manage - 岗位管理

- ID: FUNC-sys-post-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: supporting
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-post
- 其他入口: Controller SysPostController
- 独立业务结果: 维护岗位字典并供用户分配
- 功能边界: 开始=拥有 system:post:* 权限码 / 结束=岗位列表 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-dict-manage - 字典管理

- ID: FUNC-sys-dict-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: important
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-dict
- 其他入口: Controller SysDictTypeController
- 独立业务结果: 维护字典类型与字典数据，支撑下拉框与状态翻译
- 功能边界: 开始=拥有 system:dict:* 权限码 / 结束=字典类型与数据列表 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-config-manage - 参数设置

- ID: FUNC-sys-config-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: important
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-config
- 其他入口: Controller SysConfigController
- 独立业务结果: 维护运行期可改的键值参数
- 功能边界: 开始=拥有 system:config:* 权限码 / 结束=参数列表 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-sys-notice-manage - 通知公告

- ID: FUNC-sys-notice-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: supporting
- 所属业务域/场景/能力: DOM-system
- 所属模块/服务: MOD-system
- 菜单入口: MENU-sys-notice
- 其他入口: Controller SysNoticeController
- 独立业务结果: 发布与维护站内通知公告
- 功能边界: 开始=拥有 system:notice:* 权限码 / 结束=公告列表与前台展示 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-common-upload - 通用文件上传

- ID: FUNC-common-upload
- 类型: common-entry
- 交互方式: interactive
- 触发类型: api-only
- 优先级: supporting
- 所属业务域/场景/能力: DOM-common
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: API-common-upload
- 独立业务结果: 为各业务页面提供统一文件上传入口
- 功能边界: 开始=会话有效且文件类型白名单内 / 结束=文件 URL / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: no-persistence
- 详细逆向: completed

## FUNC-common-download - 通用文件下载与资源读取

- ID: FUNC-common-download
- 类型: common-entry
- 交互方式: interactive
- 触发类型: api-only
- 优先级: supporting
- 所属业务域/场景/能力: DOM-common
- 所属模块/服务: MOD-web
- 菜单入口: none
- 其他入口: API-common-download
- 独立业务结果: 按受控路径下载文件与读取本地资源
- 功能边界: 开始=会话有效 / 结束=文件流 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: no-persistence
- 详细逆向: completed

## FUNC-global-exception - 全局异常统一处理

- ID: FUNC-global-exception
- 类型: common-entry
- 交互方式: non-interactive
- 触发类型: startup-lifecycle
- 优先级: important
- 所属业务域/场景/能力: DOM-common
- 所属模块/服务: MOD-framework
- 菜单入口: none
- 其他入口: API-global-exception
- 独立业务结果: 把各类异常统一转换为 AjaxResult 响应，避免堆栈外泄
- 功能边界: 开始=应用启动完成 / 结束=统一错误响应体 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: no-persistence
- 详细逆向: completed

## FUNC-open-app-manage - 应用管理

- ID: FUNC-open-app-manage
- 类型: business
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-open
- 所属模块/服务: MOD-open
- 菜单入口: MENU-open-app
- 其他入口: Controller OpenAppController
- 独立业务结果: 维护接入开放平台的第三方应用及其密钥与状态
- 功能边界: 开始=拥有 open:app:* 权限码 / 结束=应用列表与授权关系 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-open-api-manage - 接口管理

- ID: FUNC-open-api-manage
- 类型: business
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-open
- 所属模块/服务: MOD-open
- 菜单入口: MENU-open-api
- 其他入口: Controller OpenApiMgrController
- 独立业务结果: 登记对外开放的接口定义，供应用授权与文档生成
- 功能边界: 开始=拥有 open:api:* 权限码 / 结束=接口定义列表 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-open-auth-manage - 授权管理

- ID: FUNC-open-auth-manage
- 类型: business
- 交互方式: interactive
- 触发类型: menu
- 优先级: core
- 所属业务域/场景/能力: DOM-open
- 所属模块/服务: MOD-open
- 菜单入口: MENU-open-auth
- 其他入口: Controller OpenAuthController
- 独立业务结果: 把接口授权给应用，形成可调用集合
- 功能边界: 开始=应用与接口均已存在 / 结束=授权关系矩阵 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-open-log-query - 调用日志查询

- ID: FUNC-open-log-query
- 类型: business
- 交互方式: interactive
- 触发类型: menu
- 优先级: important
- 所属业务域/场景/能力: DOM-open
- 所属模块/服务: MOD-open
- 菜单入口: MENU-open-log
- 其他入口: Controller OpenLogController
- 独立业务结果: 按应用/接口/时间/结果查询开放接口调用流水
- 功能边界: 开始=拥有 open:log:view 权限码 / 结束=调用日志列表与详情 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-open-doc-manage - 文档管理

- ID: FUNC-open-doc-manage
- 类型: business
- 交互方式: interactive
- 触发类型: menu
- 优先级: important
- 所属业务域/场景/能力: DOM-open
- 所属模块/服务: MOD-open
- 菜单入口: MENU-open-doc
- 其他入口: Controller OpenDocController
- 独立业务结果: 为已登记接口维护对外文档内容
- 功能边界: 开始=接口已存在 / 结束=接口文档 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-open-gateway-invoke - 开放接口网关调用

- ID: FUNC-open-gateway-invoke
- 类型: business
- 交互方式: non-interactive
- 触发类型: api-only
- 优先级: core
- 所属业务域/场景/能力: DOM-open
- 所属模块/服务: MOD-open
- 菜单入口: none
- 其他入口: API-open-gateway
- 独立业务结果: 对外部调用方提供统一入口：鉴权 → 路由 → 转发 → 记录调用日志 → 返回
- 功能边界: 开始=应用存在且状态正常、接口已授权、凭据有效 / 结束=上游业务响应 + 调用日志记录 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-open-selftest - 开放平台自检闭环

- ID: FUNC-open-selftest
- 类型: business
- 交互方式: non-interactive
- 触发类型: api-only
- 优先级: supporting
- 所属业务域/场景/能力: DOM-open
- 所属模块/服务: MOD-open
- 菜单入口: none
- 其他入口: API-open-selftest-echo
- 独立业务结果: 内置 httpbin 风格的被调端与自检种子，验证网关链路是否可用
- 功能边界: 开始=已执行 open_api_selftest_seed.sql 与 open_api_httpbin_min_seed.sql / 结束=自检结果与调用日志 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-job-manage - 定时任务管理

- ID: FUNC-job-manage
- 类型: platform
- 交互方式: interactive
- 触发类型: menu
- 优先级: important
- 所属业务域/场景/能力: DOM-quartz
- 所属模块/服务: MOD-quartz
- 菜单入口: MENU-job-manage
- 其他入口: Controller SysJobController
- 独立业务结果: 定义、启停、立即执行 Quartz 定时任务
- 功能边界: 开始=拥有 monitor:job:* 权限码 / 结束=任务列表与执行结果 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-job-scheduler - 定时任务调度执行

- ID: FUNC-job-scheduler
- 类型: platform
- 交互方式: non-interactive
- 触发类型: scheduled
- 优先级: core
- 所属业务域/场景/能力: DOM-quartz
- 所属模块/服务: MOD-quartz
- 菜单入口: none
- 其他入口: JOB-quartz-dispatch
- 独立业务结果: 按 Cron 触发任务并记录执行日志
- 功能边界: 开始=应用启动完成且任务 status=0 / 结束=任务执行结果与日志 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## FUNC-job-log-query - 调度日志查询

- ID: FUNC-job-log-query
- 类型: operations
- 交互方式: non-interactive
- 触发类型: api-only
- 优先级: supporting
- 所属业务域/场景/能力: DOM-quartz
- 所属模块/服务: MOD-quartz
- 菜单入口: MENU-job-manage
- 其他入口: API-joblog-list
- 独立业务结果: 查询与清理定时任务执行日志
- 功能边界: 开始=拥有 monitor:job:* 权限码 / 结束=调度日志列表 / 不包含=与本功能无直接业务结果的其他动作
- 需求面板: ./business-function-requirements.md
- 实现链: ./function-chain-index.md
- 主链状态: closed
- 详细逆向: completed

## 统计

| 触发类型 | 功能数 |
|---|---:|
| menu | 21 |
| api-only | 6 |
| startup-lifecycle | 1 |
| scheduled | 1 |

| 所属域 | 功能数 |
|---|---:|
| DOM-system | 16 |
| DOM-open | 7 |
| DOM-common | 3 |
| DOM-quartz | 3 |
