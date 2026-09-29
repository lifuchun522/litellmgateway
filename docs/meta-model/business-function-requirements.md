# 业务功能需求面板（Business Function Requirements）

> 产物语言：zh-CN ｜ 本文件与 [`functional-inventory.md`](./functional-inventory.md) 的 `FUNC-*` 一一对应，不含 ID 主定义。
>
> 说明：每个面板顶部的 12 个规范字段（`Business Goal` 等）按技能 output-contract 要求以紧凑形式给出，其完整中文描述紧随其后列在「面板明细」中。

## FUNC-sys-login - 用户登录认证

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP login
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 校验用户凭据与验证码，建立服务端会话并加载其菜单与权限
- 参与者（Actors）: 系统管理员、普通用户
- 触发入口（Trigger Entries）: HTTP login
- 前置条件（Preconditions）: 用户已存在于 sys_user 且 status=0，账号未被锁定
- 主流程（Main Steps）: GET /login 渲染登录页 → POST /login 提交账号密码与验证码 → 校验验证码 → Shiro Realm 认证 → 记录登录日志 → 建立会话 → 跳转 /index
- 业务规则（Business Rules）: 验证码由 shiro.user.captchaEnabled/captchaType 控制；密码连续错误次数受 user.password.maxRetryCount=5 限制；status=2 视为停用
- 输出与结果（Outputs And Results）: 登录成功跳转首页；失败返回错误提示并计数
- 状态变化（State Changes）: sys_user.login_date/login_ip 更新；sys_logininfor 新增记录；Shiro 会话创建
- 失败分支（Failure Outcomes）: 验证码错误、账号不存在、密码错误、账号停用、超过重试上限被锁定
- 人工干预（Manual Intervention）: 管理员在 sys_user 中重置密码或恢复账号状态
- 权限与数据范围（Permission And Data Scope）: 登录接口匿名可访问，权限码无
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-logout - 用户退出登录

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP logout
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 注销当前会话并释放在线用户记录
- 参与者（Actors）: 已登录用户
- 触发入口（Trigger Entries）: HTTP logout
- 前置条件（Preconditions）: 存在有效会话
- 主流程（Main Steps）: GET /logout → Shiro 登出 → 删除在线会话 → 记录登出日志 → 重定向登录页
- 业务规则（Business Rules）: 登出必须清理 sys_user_online 中对应会话记录
- 输出与结果（Outputs And Results）: 会话失效，跳转登录页
- 状态变化（State Changes）: sys_user_online 删除当前会话行
- 失败分支（Failure Outcomes）: 会话已过期时幂等返回登录页
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 已认证用户
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-captcha - 验证码生成

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP captchaImage
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 产生算数类型验证码图片并以会话键值绑定答案
- 参与者（Actors）: 匿名访问者、登录页
- 触发入口（Trigger Entries）: HTTP captchaImage
- 前置条件（Preconditions）: shiro.user.captchaEnabled=true 时启用
- 主流程（Main Steps）: GET /captchaImage → 生成算式 → 写入会话 verCode → 返回 Base64 图片与 uuid
- 业务规则（Business Rules）: 验证码类型由 shiro.user.captchaType=math 决定；开发期可通过 qvsu.testing.exposeCaptchaCode 暴露答案
- 输出与结果（Outputs And Results）: 返回 {uuid, img} JSON
- 状态变化（State Changes）: 会话中写入验证码答案
- 失败分支（Failure Outcomes）: 验证码开关关闭时返回说明
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 匿名可访问
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-register - 用户注册

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP register
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 开放自助注册入口创建新用户
- 参与者（Actors）: 匿名访问者
- 触发入口（Trigger Entries）: HTTP register
- 前置条件（Preconditions）: 系统允许注册
- 主流程（Main Steps）: GET /register 渲染 → POST /register 提交 → 唯一性校验 → 新增用户
- 业务规则（Business Rules）: 登录名唯一；默认分配普通角色
- 输出与结果（Outputs And Results）: 注册成功提示
- 状态变化（State Changes）: sys_user 新增一行
- 失败分支（Failure Outcomes）: 登录名已存在、验证码错误
- 人工干预（Manual Intervention）: 管理员审核角色分配
- 权限与数据范围（Permission And Data Scope）: 匿名可访问（属高风险开放入口）
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-index - 后台首页与工作台

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP index
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 登录后渲染后台主框架首页
- 参与者（Actors）: 已登录用户
- 触发入口（Trigger Entries）: HTTP index
- 前置条件（Preconditions）: 会话有效
- 主流程（Main Steps）: GET /index → 加载菜单树 → 渲染主框架
- 业务规则（Business Rules）: 菜单树按当前用户权限过滤
- 输出与结果（Outputs And Results）: 后台主页面
- 状态变化（State Changes）: 无持久化变更
- 失败分支（Failure Outcomes）: 未登录跳转 /login
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 已认证用户
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-unauth - 未授权提示页

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP unauth
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 权限不足时给出统一提示
- 参与者（Actors）: 已登录用户
- 触发入口（Trigger Entries）: HTTP unauth
- 前置条件（Preconditions）: 访问了无权限资源
- 主流程（Main Steps）: GET /unauth → 渲染提示页
- 业务规则（Business Rules）: 由 shiro.user.unauthorizedUrl 指定
- 输出与结果（Outputs And Results）: 提示页面
- 状态变化（State Changes）: 无
- 失败分支（Failure Outcomes）: 无
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 已认证用户
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-profile - 个人中心维护

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP system/user/profile
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 用户维护本人资料与密码
- 参与者（Actors）: 已登录用户
- 触发入口（Trigger Entries）: HTTP system/user/profile
- 前置条件（Preconditions）: 会话有效
- 主流程（Main Steps）: 查看基本资料 → 修改资料 → 修改密码 → 上传头像 → 保存
- 业务规则（Business Rules）: 只能修改本人数据；密码需校验原密码；手机号/邮箱唯一性
- 输出与结果（Outputs And Results）: 资料更新成功提示
- 状态变化（State Changes）: sys_user 对应行更新
- 失败分支（Failure Outcomes）: 原密码错误、唯一性冲突、文件类型不合法
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 仅本人数据
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-profile-avatar - 头像上传

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP system/user/profile/avatar
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 上传并替换当前用户头像文件
- 参与者（Actors）: 已登录用户
- 触发入口（Trigger Entries）: HTTP system/user/profile/avatar
- 前置条件（Preconditions）: 会话有效
- 主流程（Main Steps）: 选择图片 → POST 上传 → 校验类型与大小 → 落盘 qvsu.profile 目录 → 更新 avatar 字段
- 业务规则（Business Rules）: 受 spring.servlet.multipart.max-file-size=10MB 限制；白名单扩展名
- 输出与结果（Outputs And Results）: 返回头像访问 URL
- 状态变化（State Changes）: 文件系统新增文件；sys_user.avatar 更新
- 失败分支（Failure Outcomes）: 文件过大、类型不允许、磁盘写入失败
- 人工干预（Manual Intervention）: 清理 qvsu.profile 目录
- 权限与数据范围（Permission And Data Scope）: 仅本人
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-user-manage - 用户管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-user PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:user:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护系统用户账号及其角色、岗位、部门归属
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-user PAGE
- 前置条件（Preconditions）: 拥有 system:user:* 权限码
- 主流程（Main Steps）: 查询列表（部门树过滤）→ 新增用户 → 分配角色/岗位 → 编辑 → 重置密码 → 停用/启用 → 删除
- 业务规则（Business Rules）: 登录名唯一；admin 账号不可删除；逻辑删除用 del_flag；密码经安全工具加盐哈希
- 输出与结果（Outputs And Results）: 用户列表与增删改结果
- 状态变化（State Changes）: sys_user 及两张关联表读写
- 失败分支（Failure Outcomes）: 登录名重复、无权限、删除超管被拒
- 人工干预（Manual Intervention）: 超管账号问题需 DBA 介入
- 权限与数据范围（Permission And Data Scope）: 数据范围 dataScope 控制可见部门
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-role-manage - 角色管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-role PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:role:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护角色、菜单权限与数据范围
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-role PAGE
- 前置条件（Preconditions）: 拥有 system:role:* 权限码
- 主流程（Main Steps）: 查询 → 新增/编辑角色 → 勾选菜单权限 → 设置数据范围 → 停用/删除
- 业务规则（Business Rules）: 角色名与权限字符唯一；admin 角色不可改；数据范围 1-5 对应全部/自定义/本部门/本部门及以下/仅本人
- 输出与结果（Outputs And Results）: 角色列表与授权结果
- 状态变化（State Changes）: sys_role、sys_role_menu、sys_role_dept 读写
- 失败分支（Failure Outcomes）: 权限字符重复、删除已分配用户的角色被拒
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 超管独占
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-menu-manage - 菜单管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-menu PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:menu:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护菜单树与按钮权限码，驱动前端路由与后端鉴权
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-menu PAGE
- 前置条件（Preconditions）: 拥有 system:menu:* 权限码
- 主流程（Main Steps）: 查看菜单树 → 新增目录/菜单/按钮 → 设置路由、权限码、图标、排序 → 编辑 → 删除
- 业务规则（Business Rules）: 权限码唯一；存在子菜单或已被角色引用时不可删除；menu_type M/C/F 分别代表目录/菜单/按钮
- 输出与结果（Outputs And Results）: 菜单树结构
- 状态变化（State Changes）: sys_menu 读写
- 失败分支（Failure Outcomes）: 权限码重复、存在子节点被拒删
- 人工干预（Manual Intervention）: 菜单种子脚本 open_api_menu.sql 与应用内维护存在双写风险
- 权限与数据范围（Permission And Data Scope）: 超管独占
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-dept-manage - 部门管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-dept PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:dept:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护组织机构树，为数据范围提供层级基础
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-dept PAGE
- 前置条件（Preconditions）: 拥有 system:dept:* 权限码
- 主流程（Main Steps）: 查看部门树 → 新增下级 → 编辑 → 调整上级 → 删除
- 业务规则（Business Rules）: 存在下级部门或已分配用户时不可删除；ancestors 字段维护祖先链
- 输出与结果（Outputs And Results）: 部门树
- 状态变化（State Changes）: sys_dept 读写，ancestors 级联更新
- 失败分支（Failure Outcomes）: 存在子节点或用户被拒删
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 超管独占
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-post-manage - 岗位管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-post PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:post:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护岗位字典并供用户分配
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-post PAGE
- 前置条件（Preconditions）: 拥有 system:post:* 权限码
- 主流程（Main Steps）: 查询 → 新增 → 编辑 → 停用/启用 → 删除
- 业务规则（Business Rules）: 岗位编码唯一；已分配用户的岗位不可删除
- 输出与结果（Outputs And Results）: 岗位列表
- 状态变化（State Changes）: sys_post 读写
- 失败分支（Failure Outcomes）: 编码重复、被引用拒删
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 超管独占
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-dict-manage - 字典管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-dict PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:dict:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护字典类型与字典数据，支撑下拉框与状态翻译
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-dict PAGE
- 前置条件（Preconditions）: 拥有 system:dict:* 权限码
- 主流程（Main Steps）: 维护字典类型 → 维护字典数据 → 启停 → 删除 → 刷新缓存
- 业务规则（Business Rules）: 字典类型 type 唯一；字典数据按 dict_sort 排序；修改后需刷新缓存
- 输出与结果（Outputs And Results）: 字典类型与数据列表
- 状态变化（State Changes）: sys_dict_type、sys_dict_data 读写
- 失败分支（Failure Outcomes）: 类型重复、缓存未刷新导致前端仍显示旧值
- 人工干预（Manual Intervention）: 可调用刷新缓存接口
- 权限与数据范围（Permission And Data Scope）: 超管独占
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-config-manage - 参数设置

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-config PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:config:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护运行期可改的键值参数
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-config PAGE
- 前置条件（Preconditions）: 拥有 system:config:* 权限码
- 主流程（Main Steps）: 查询 → 新增参数 → 编辑 → 删除 → 刷新缓存
- 业务规则（Business Rules）: 参数键 config_key 唯一；内置参数不可删除；修改需刷新缓存
- 输出与结果（Outputs And Results）: 参数列表
- 状态变化（State Changes）: sys_config 读写
- 失败分支（Failure Outcomes）: 键重复、内置参数拒删
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 超管独占
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-sys-notice-manage - 通知公告

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-sys-notice PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION system:notice:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 发布与维护站内通知公告
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-sys-notice PAGE
- 前置条件（Preconditions）: 拥有 system:notice:* 权限码
- 主流程（Main Steps）: 查询 → 新增公告 → 编辑 → 发布/关闭 → 删除
- 业务规则（Business Rules）: notice_type 区分通知与公告；status 控制是否展示
- 输出与结果（Outputs And Results）: 公告列表与前台展示
- 状态变化（State Changes）: sys_notice 读写
- 失败分支（Failure Outcomes）: 无权限、内容超长
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 超管与授权角色
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-common-upload - 通用文件上传

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP common/upload
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 为各业务页面提供统一文件上传入口
- 参与者（Actors）: 已登录用户
- 触发入口（Trigger Entries）: HTTP common/upload
- 前置条件（Preconditions）: 会话有效且文件类型白名单内
- 主流程（Main Steps）: POST /common/upload → 类型与大小校验 → 落盘 → 返回 URL
- 业务规则（Business Rules）: 受 max-file-size 限制；扩展名白名单；文件名重命名防穿越
- 输出与结果（Outputs And Results）: 文件 URL
- 状态变化（State Changes）: 文件系统写入
- 失败分支（Failure Outcomes）: 超限、类型不允许
- 人工干预（Manual Intervention）: 清理上传目录
- 权限与数据范围（Permission And Data Scope）: 已认证用户
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-common-download - 通用文件下载与资源读取

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP common/download
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 按受控路径下载文件与读取本地资源
- 参与者（Actors）: 已登录用户
- 触发入口（Trigger Entries）: HTTP common/download
- 前置条件（Preconditions）: 会话有效
- 主流程（Main Steps）: GET /common/download → 路径校验 → 流式返回
- 业务规则（Business Rules）: 必须校验路径在允许目录内，防目录穿越
- 输出与结果（Outputs And Results）: 文件流
- 状态变化（State Changes）: 无
- 失败分支（Failure Outcomes）: 文件不存在、路径非法
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 已认证用户
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-global-exception - 全局异常统一处理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: INTERNAL
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 把各类异常统一转换为 AjaxResult 响应，避免堆栈外泄
- 参与者（Actors）: 系统（所有请求）
- 触发入口（Trigger Entries）: INTERNAL GlobalExceptionHandler
- 前置条件（Preconditions）: 应用启动完成
- 主流程（Main Steps）: 请求抛异常 → @ControllerAdvice 捕获 → 分类转换 → 返回统一 JSON 或错误页
- 业务规则（Business Rules）: 业务异常返回 code=500 与中文提示；权限异常转 403；未捕获异常记录日志
- 输出与结果（Outputs And Results）: 统一错误响应体
- 状态变化（State Changes）: 无持久化
- 失败分支（Failure Outcomes）: 异常处理器自身异常会退化为默认错误页
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 全局
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-open-app-manage - 应用管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-open-app PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION open:app:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 维护接入开放平台的第三方应用及其密钥与状态
- 参与者（Actors）: 开放平台管理员
- 触发入口（Trigger Entries）: MENU-open-app PAGE
- 前置条件（Preconditions）: 拥有 open:app:* 权限码
- 主流程（Main Steps）: GET /admin/open/app 页面 → POST /admin/open/app/list 查询 → /add 新增 → /edit 修改 → /remove 删除 → 绑定可调用接口
- 业务规则（Business Rules）: 应用标识唯一；密钥由服务端生成；停用应用后其全部调用应被拒
- 输出与结果（Outputs And Results）: 应用列表与授权关系
- 状态变化（State Changes）: open_app 与 open_app_api 读写
- 失败分支（Failure Outcomes）: 标识重复、删除仍被授权引用的应用被拒
- 人工干预（Manual Intervention）: 密钥泄露需在应用管理中重置
- 权限与数据范围（Permission And Data Scope）: open:app:* 权限码控制
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-open-api-manage - 接口管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-open-api PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION open:api:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 登记对外开放的接口定义，供应用授权与文档生成
- 参与者（Actors）: 开放平台管理员
- 触发入口（Trigger Entries）: MENU-open-api PAGE
- 前置条件（Preconditions）: 拥有 open:api:* 权限码
- 主流程（Main Steps）: GET /admin/open/api 页面 → /list 查询 → /add 新增 → /edit 修改 → /remove 删除 → /curl 查看调试信息
- 业务规则（Business Rules）: 接口编码唯一；接口须归属某个上游服务；删除前须解除应用授权
- 输出与结果（Outputs And Results）: 接口定义列表
- 状态变化（State Changes）: open_api 读写
- 失败分支（Failure Outcomes）: 编码重复、被授权引用拒删
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: open:api:* 权限码控制
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-open-auth-manage - 授权管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-open-auth PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION open:auth:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 把接口授权给应用，形成可调用集合
- 参与者（Actors）: 开放平台管理员
- 触发入口（Trigger Entries）: MENU-open-auth PAGE
- 前置条件（Preconditions）: 应用与接口均已存在
- 主流程（Main Steps）: GET /admin/open/auth 页面 → 选择应用 → 勾选接口 → 保存授权 → 撤销授权
- 业务规则（Business Rules）: 授权为应用与接口的多对多关系，重复授权应幂等；未授权接口调用必须被拒
- 输出与结果（Outputs And Results）: 授权关系矩阵
- 状态变化（State Changes）: open_app_api 读写
- 失败分支（Failure Outcomes）: 应用或接口不存在、重复授权
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: open:auth:* 权限码控制
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-open-log-query - 调用日志查询

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-open-log PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION open:log:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 按应用/接口/时间/结果查询开放接口调用流水
- 参与者（Actors）: 开放平台管理员、运维
- 触发入口（Trigger Entries）: MENU-open-log PAGE
- 前置条件（Preconditions）: 拥有 open:log:view 权限码
- 主流程（Main Steps）: GET /admin/open/log 页面 → 条件查询 → 查看详情（请求头/耗时/结果）→ 导出
- 业务规则（Business Rules）: 日志只读；分页查询；敏感请求头需脱敏展示
- 输出与结果（Outputs And Results）: 调用日志列表与详情
- 状态变化（State Changes）: open_call_log 只读
- 失败分支（Failure Outcomes）: 无
- 人工干预（Manual Intervention）: 归档需 DBA 处理
- 权限与数据范围（Permission And Data Scope）: open:log:* 权限码控制
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-open-doc-manage - 文档管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-open-doc PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION open:doc:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 为已登记接口维护对外文档内容
- 参与者（Actors）: 开放平台管理员
- 触发入口（Trigger Entries）: MENU-open-doc PAGE
- 前置条件（Preconditions）: 接口已存在
- 主流程（Main Steps）: 列表 → 新增/编辑文档 → 关联接口 → 预览 → 删除
- 业务规则（Business Rules）: 一个接口可有版本化文档；文档内容支持富文本
- 输出与结果（Outputs And Results）: 接口文档
- 状态变化（State Changes）: open_api_doc 读写
- 失败分支（Failure Outcomes）: 关联接口不存在
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: open:doc:* 权限码控制
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-open-gateway-invoke - 开放接口网关调用

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP open
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 对外部调用方提供统一入口：鉴权 → 路由 → 转发 → 记录调用日志 → 返回
- 参与者（Actors）: 第三方应用（机器调用）
- 触发入口（Trigger Entries）: HTTP open
- 前置条件（Preconditions）: 应用存在且状态正常、接口已授权、凭据有效
- 主流程（Main Steps）: 外部请求进入 /open/** → 网关过滤器解析应用凭据 → 校验应用状态 → 校验接口授权 → 路由到目标上游 → 记录 open_call_log → 返回响应
- 业务规则（Business Rules）: 未授权接口必须拒绝；应用停用必须拒绝；调用全过程须留痕；日志需记录请求头与耗时
- 输出与结果（Outputs And Results）: 上游业务响应 + 调用日志记录
- 状态变化（State Changes）: open_call_log 新增；不修改应用与接口定义
- 失败分支（Failure Outcomes）: 凭据缺失/非法、应用停用、接口未授权、上游超时、上游异常
- 人工干预（Manual Intervention）: 管理员通过应用管理停用问题应用；通过调用日志定位失败原因
- 权限与数据范围（Permission And Data Scope）: 面向公网/内网第三方，非 Shiro 会话体系，属高风险入口
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-open-selftest - 开放平台自检闭环

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: HTTP open/selftest
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 内置 httpbin 风格的被调端与自检种子，验证网关链路是否可用
- 参与者（Actors）: 平台管理员、自动化校验
- 触发入口（Trigger Entries）: HTTP open/selftest
- 前置条件（Preconditions）: 已执行 open_api_selftest_seed.sql 与 open_api_httpbin_min_seed.sql
- 主流程（Main Steps）: 访问自检被调端 → 通过网关发起调用 → 校验 open_call_log 是否落库 → 断言链路通
- 业务规则（Business Rules）: 自检端点仅用于验证，生产环境需评估是否暴露
- 输出与结果（Outputs And Results）: 自检结果与调用日志
- 状态变化（State Changes）: 种子数据写入；open_call_log 读取校验
- 失败分支（Failure Outcomes）: 网关鉴权失败、路由失败、日志未落库
- 人工干预（Manual Intervention）: 重新执行种子 SQL
- 权限与数据范围（Permission And Data Scope）: 平台管理员与自动化
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-job-manage - 定时任务管理

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-job-manage PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION monitor:job:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 定义、启停、立即执行 Quartz 定时任务
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-job-manage PAGE
- 前置条件（Preconditions）: 拥有 monitor:job:* 权限码
- 主流程（Main Steps）: 列表 → 新增任务（调用目标、Cron）→ 启动/暂停 → 立即执行一次 → 修改 → 删除
- 业务规则（Business Rules）: Cron 表达式合法性校验；调用目标白名单校验；任务名唯一
- 输出与结果（Outputs And Results）: 任务列表与执行结果
- 状态变化（State Changes）: sys_job 读写；Quartz 调度器注册/移除
- 失败分支（Failure Outcomes）: Cron 非法、调用目标黑名单被拒、执行异常
- 人工干预（Manual Intervention）: 暂停问题任务
- 权限与数据范围（Permission And Data Scope）: 超管
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-job-scheduler - 定时任务调度执行

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: INTERNAL
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: SESSION-AUTHENTICATED
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 按 Cron 触发任务并记录执行日志
- 参与者（Actors）: 系统（Quartz 线程池）
- 触发入口（Trigger Entries）: INTERNAL SysJobServiceImpl
- 前置条件（Preconditions）: 应用启动完成且任务 status=0
- 主流程（Main Steps）: Quartz 触发 → 反射调用目标方法 → 捕获结果与异常 → 写 sys_job_log → 更新上次执行信息
- 业务规则（Business Rules）: 并发执行策略受 concurrent 标志控制；异常不中断调度器
- 输出与结果（Outputs And Results）: 任务执行结果与日志
- 状态变化（State Changes）: sys_job_log 新增；sys_job 执行信息更新
- 失败分支（Failure Outcomes）: 目标方法不存在、执行抛异常、执行超时
- 人工干预（Manual Intervention）: 通过任务管理暂停并排查
- 权限与数据范围（Permission And Data Scope）: 系统内部
- 实现主链（Implementation Chain）: ./function-chain-index.md

## FUNC-job-log-query - 调度日志查询

- Business Goal: SEE-PANEL-DETAIL
- Actors: SEE-PANEL-DETAIL
- Trigger Entries: MENU-job-manage PAGE
- Preconditions: SESSION-OR-SYSTEM-READY
- Main Steps: SEE-PANEL-DETAIL
- Business Rules: SEE-PANEL-DETAIL
- Outputs And Results: SEE-PANEL-DETAIL
- State Changes: SEE-PANEL-DETAIL
- Failure Outcomes: SEE-PANEL-DETAIL
- Manual Intervention: SEE-PANEL-DETAIL
- Permission And Data Scope: PERMISSION monitor:job:view
- Implementation Chain: ./function-chain-index.md

### 面板明细

- 业务目标（Business Goal）: 查询与清理定时任务执行日志
- 参与者（Actors）: 系统管理员
- 触发入口（Trigger Entries）: MENU-job-manage PAGE
- 前置条件（Preconditions）: 拥有 monitor:job:* 权限码
- 主流程（Main Steps）: 列表查询 → 查看详情 → 清空
- 业务规则（Business Rules）: 日志只读，仅允许删除与清空
- 输出与结果（Outputs And Results）: 调度日志列表
- 状态变化（State Changes）: sys_job_log 读取删除
- 失败分支（Failure Outcomes）: 无
- 人工干预（Manual Intervention）: 无
- 权限与数据范围（Permission And Data Scope）: 超管
- 实现主链（Implementation Chain）: ./function-chain-index.md
