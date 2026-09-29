# 领域对象模型（Domain Model）

> 产物语言：zh-CN ｜ 本文件是全部 `OBJ-*` 稳定 ID 的**唯一主定义位置**。

共 33 个对象，全部来自 `open-api/qvsu-openapi/src/main/java` 下的 `domain` 与 `model` 包，以及 `common/core/domain` 的基类与响应结构。

## 0. 对象分类汇总

| 类别 | 数量 | 对象 |
|---|---:|---|
| entity | 23 | SysUser, SysRole, SysMenu, SysDept, SysPost, SysDictType, SysDictData, SysConfig, SysNotice, SysOperLog, SysLogininfor, SysUserOnline, SysUserRole, SysRoleMenu, SysRoleDept, SysUserPost, SysJob, SysJobLog, OpenApp, OpenApi, OpenAppApi, OpenCallLog, OpenApiDoc |
| DTO | 6 | AjaxResult, R, CxSelect, Ztree, TableDataInfo, OpenResult |
| value-object | 4 | BaseEntity, OptBaseEntity, TreeEntity, OpenAuthContext |

## 1. 对象与物理表映射

| 对象 | 类别 | 物理表 | 聚合根 |
|---|---|---|---|
| AjaxResult | DTO | （无，非持久化） | 否 |
| R | DTO | （无，非持久化） | 否 |
| BaseEntity | value-object | （无，非持久化） | 否 |
| OptBaseEntity | value-object | （无，非持久化） | 否 |
| TreeEntity | value-object | （无，非持久化） | 否 |
| CxSelect | DTO | （无，非持久化） | 否 |
| Ztree | DTO | （无，非持久化） | 否 |
| TableDataInfo | DTO | （无，非持久化） | 否 |
| SysUser | entity | `sys_user` | 是 |
| SysRole | entity | `sys_role` | 是 |
| SysMenu | entity | `sys_menu` | 是 |
| SysDept | entity | `sys_dept` | 是 |
| SysPost | entity | `sys_post` | 否 |
| SysDictType | entity | `sys_dict_type` | 否 |
| SysDictData | entity | `sys_dict_data` | 否 |
| SysConfig | entity | `sys_config` | 否 |
| SysNotice | entity | `sys_notice` | 否 |
| SysOperLog | entity | `sys_oper_log` | 否 |
| SysLogininfor | entity | `sys_logininfor` | 否 |
| SysUserOnline | entity | `sys_user_online` | 否 |
| SysUserRole | entity | `sys_user_role` | 否 |
| SysRoleMenu | entity | `sys_role_menu` | 否 |
| SysRoleDept | entity | `sys_role_dept` | 否 |
| SysUserPost | entity | `sys_user_post` | 否 |
| SysJob | entity | `sys_job` | 否 |
| SysJobLog | entity | `sys_job_log` | 否 |
| OpenApp | entity | `open_app` | 是 |
| OpenApi | entity | `open_api` | 是 |
| OpenAppApi | entity | `open_app_api` | 否 |
| OpenCallLog | entity | `open_call_log` | 否 |
| OpenApiDoc | entity | `open_api_doc` | 否 |
| OpenAuthContext | value-object | （无，非持久化） | 否 |
| OpenResult | DTO | （无，非持久化） | 否 |

## 2. 对象主定义

## OBJ-AjaxResult - AjaxResult

- ID: OBJ-AjaxResult
- 类别: DTO
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 统一 Ajax 响应包装（继承 HashMap，含 code/msg/data）
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/AjaxResult.java`

## OBJ-R - R

- ID: OBJ-R
- 类别: DTO
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 泛型统一返回对象（含 code/msg/data 三字段）
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/R.java`

## OBJ-BaseEntity - BaseEntity

- ID: OBJ-BaseEntity
- 类别: value-object
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 实体公共基类（searchValue/createBy/createTime/updateBy/updateTime/remark/params 共 7 字段）
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/BaseEntity.java`

## OBJ-OptBaseEntity - OptBaseEntity

- ID: OBJ-OptBaseEntity
- 类别: value-object
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 开放平台实体公共基类（14 字段，含审计与逻辑删除字段）
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/OptBaseEntity.java`

## OBJ-TreeEntity - TreeEntity

- ID: OBJ-TreeEntity
- 类别: value-object
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 树形实体基类（parentName/parentId/orderNum/ancestors）
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/TreeEntity.java`

## OBJ-CxSelect - CxSelect

- ID: OBJ-CxSelect
- 类别: DTO
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 前端级联下拉数据结构（name/value/children）
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/CxSelect.java`

## OBJ-Ztree - Ztree

- ID: OBJ-Ztree
- 类别: DTO
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: ZTree 树控件节点结构
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/Ztree.java`

## OBJ-TableDataInfo - TableDataInfo

- ID: OBJ-TableDataInfo
- 类别: DTO
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 分页响应结构（total/rows/code/msg），由 PageHelper 驱动
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/page/TableDataInfo.java`

## OBJ-SysUser - SysUser

- ID: OBJ-SysUser
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 用户实体（22 字段），聚合根，携带角色/岗位集合与部门引用
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_user` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_user`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysUser.java`

## OBJ-SysRole - SysRole

- ID: OBJ-SysRole
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 角色实体（10 字段），含数据范围 dataScope 与菜单勾选集合
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_role` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_role`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysRole.java`

## OBJ-SysMenu - SysMenu

- ID: OBJ-SysMenu
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 菜单实体（12 字段），菜单树节点，权限码载体
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_menu` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_menu`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysMenu.java`

## OBJ-SysDept - SysDept

- ID: OBJ-SysDept
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 部门实体（12 字段），继承 TreeEntity，组织机构树节点
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_dept` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_dept`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysDept.java`

## OBJ-SysPost - SysPost

- ID: OBJ-SysPost
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 岗位实体（5 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_post` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_post`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysPost.java`

## OBJ-SysDictType - SysDictType

- ID: OBJ-SysDictType
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 字典类型实体（4 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_dict_type` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_dict_type`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysDictType.java`

## OBJ-SysDictData - SysDictData

- ID: OBJ-SysDictData
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 字典数据实体（9 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_dict_data` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_dict_data`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysDictData.java`

## OBJ-SysConfig - SysConfig

- ID: OBJ-SysConfig
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 参数配置实体（5 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_config` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_config`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysConfig.java`

## OBJ-SysNotice - SysNotice

- ID: OBJ-SysNotice
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 通知公告实体（5 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_notice` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_notice`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysNotice.java`

## OBJ-SysOperLog - SysOperLog

- ID: OBJ-SysOperLog
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 操作审计日志实体（18 字段），由 AOP 切面写入
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_oper_log` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_oper_log`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysOperLog.java`

## OBJ-SysLogininfor - SysLogininfor

- ID: OBJ-SysLogininfor
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 登录日志实体（9 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_logininfor` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_logininfor`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysLogininfor.java`

## OBJ-SysUserOnline - SysUserOnline

- ID: OBJ-SysUserOnline
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 在线用户会话实体（10 字段），Shiro 会话持久化载体
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_user_online` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_user_online`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysUserOnline.java`

## OBJ-SysUserRole - SysUserRole

- ID: OBJ-SysUserRole
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 用户-角色关联实体（2 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_user_role` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_user_role`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysUserRole.java`

## OBJ-SysRoleMenu - SysRoleMenu

- ID: OBJ-SysRoleMenu
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 角色-菜单关联实体（2 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_role_menu` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_role_menu`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysRoleMenu.java`

## OBJ-SysRoleDept - SysRoleDept

- ID: OBJ-SysRoleDept
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 角色-部门数据范围关联实体（2 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_role_dept` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_role_dept`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysRoleDept.java`

## OBJ-SysUserPost - SysUserPost

- ID: OBJ-SysUserPost
- 类别: entity
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 用户-岗位关联实体（2 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_user_post` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_user_post`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysUserPost.java`

## OBJ-SysJob - SysJob

- ID: OBJ-SysJob
- 类别: entity
- 所有者: com.qvsu.quartz（调度域）
- 业务或契约含义: 定时任务定义实体（10 字段），含 cronExpression 与调用目标
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_job` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_job`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/domain/SysJob.java`

## OBJ-SysJobLog - SysJobLog

- ID: OBJ-SysJobLog
- 类别: entity
- 所有者: com.qvsu.quartz（调度域）
- 业务或契约含义: 定时任务执行日志实体（9 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-sys_job_log` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `sys_job_log`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/domain/SysJobLog.java`

## OBJ-OpenApp - OpenApp

- ID: OBJ-OpenApp
- 类别: entity
- 所有者: com.qvsu.open（开放平台域）
- 业务或契约含义: 开放平台接入应用实体（7 字段），聚合根，含应用密钥
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-open_app` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `open_app`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 开放平台第三方调用方（经网关）与管理页面
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenApp.java`

## OBJ-OpenApi - OpenApi

- ID: OBJ-OpenApi
- 类别: entity
- 所有者: com.qvsu.open（开放平台域）
- 业务或契约含义: 对外开放接口定义实体（10 字段），聚合根
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-open_api` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `open_api`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 开放平台第三方调用方（经网关）与管理页面
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenApi.java`

## OBJ-OpenAppApi - OpenAppApi

- ID: OBJ-OpenAppApi
- 类别: entity
- 所有者: com.qvsu.open（开放平台域）
- 业务或契约含义: 应用-接口授权关联实体（2 字段），多对多关系载体
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-open_app_api` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `open_app_api`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 开放平台第三方调用方（经网关）与管理页面
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenAppApi.java`

## OBJ-OpenCallLog - OpenCallLog

- ID: OBJ-OpenCallLog
- 类别: entity
- 所有者: com.qvsu.open（开放平台域）
- 业务或契约含义: 开放接口调用日志实体（13 字段），网关写入
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-open_call_log` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `open_call_log`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 开放平台第三方调用方（经网关）与管理页面
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenCallLog.java`

## OBJ-OpenApiDoc - OpenApiDoc

- ID: OBJ-OpenApiDoc
- 类别: entity
- 所有者: com.qvsu.open（开放平台域）
- 业务或契约含义: 接口文档实体（5 字段）
- 字段摘要或字段表: 字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-open_api_doc` 一节
- 生命周期/状态: 由对应 Mapper 在事务内创建、更新与逻辑删除
- 映射物理表/接口: `open_api_doc`（主定义见 [`database-model.md`](./database-model.md)）
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 开放平台第三方调用方（经网关）与管理页面
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenApiDoc.java`

## OBJ-OpenAuthContext - OpenAuthContext

- ID: OBJ-OpenAuthContext
- 类别: value-object
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 网关鉴权上下文（承载调用方应用、凭据解析结果），非持久化
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/model/OpenAuthContext.java`

## OBJ-OpenResult - OpenResult

- ID: OBJ-OpenResult
- 类别: DTO
- 所有者: com.qvsu.system / com.qvsu.common（系统与公共域）
- 业务或契约含义: 开放平台统一返回结构，非持久化
- 字段摘要或字段表: 非持久化对象，无对应物理字段表
- 生命周期/状态: 随单次请求创建与销毁
- 映射物理表/接口: 无物理表，作为请求/响应或上下文载体
- 核心功能: 见 [`functional-inventory.md`](./functional-inventory.md) 与 [`database-access-matrix.md`](./database-access-matrix.md)
- 外部消费者: 后台管理页面与框架内部组件
- 代码落点: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/model/OpenResult.java`

## 3. 对象继承关系

| 派生对象 | 基类 | 说明 |
|---|---|---|
| SysUser | BaseEntity | 继承公共审计字段 |
| SysRole | BaseEntity | 继承公共审计字段 |
| SysMenu | BaseEntity | 继承公共审计字段 |
| SysDept | TreeEntity | 继承公共审计字段 |
| SysPost | BaseEntity | 继承公共审计字段 |
| SysDictType | BaseEntity | 继承公共审计字段 |
| SysDictData | BaseEntity | 继承公共审计字段 |
| SysConfig | BaseEntity | 继承公共审计字段 |
| SysNotice | BaseEntity | 继承公共审计字段 |
| SysOperLog | BaseEntity | 继承公共审计字段 |
| SysLogininfor | BaseEntity | 继承公共审计字段 |
| SysUserOnline | BaseEntity | 继承公共审计字段 |
| SysJob | BaseEntity | 继承公共审计字段 |
| SysJobLog | BaseEntity | 继承公共审计字段 |
| OpenApp | OptBaseEntity | 继承公共审计字段 |
| OpenApi | OptBaseEntity | 继承公共审计字段 |
| OpenAppApi | OptBaseEntity | 继承公共审计字段 |
| OpenCallLog | OptBaseEntity | 继承公共审计字段 |
| OpenApiDoc | OptBaseEntity | 继承公共审计字段 |

## 4. 无实体映射的物理表

以下物理表由框架或 SQL 直接管理，无对应 Java 实体类，属于**已知缺口**，其字段语义只能由 DDL 与 SQL 证据支撑：

| 物理表 | 原因 | 证据 |
|---|---|---|
| `QRTZ_BLOB_TRIGGERS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_CALENDARS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_CRON_TRIGGERS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_FIRED_TRIGGERS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_JOB_DETAILS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_LOCKS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_PAUSED_TRIGGER_GRPS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_SCHEDULER_STATE` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_SIMPLE_TRIGGERS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_SIMPROP_TRIGGERS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |
| `QRTZ_TRIGGERS` | Quartz 框架内部 JDBC 直连，无 MyBatis 实体 | 全量扫描 `src/main/java` 无同名或近似实体类 |

## 5. 相关文档

- 表主定义：[`database-model.md`](./database-model.md)
- 字段设计：[`database-schema.md`](./database-schema.md)
- 读写矩阵：[`database-access-matrix.md`](./database-access-matrix.md)
- 数据归属：[`data-ownership.md`](./data-ownership.md)
