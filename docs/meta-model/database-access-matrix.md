# 功能到物理表读写矩阵（Database Access Matrix）

> 产物语言：zh-CN ｜ 本文件不含 ID 主定义，`FUNC-*` 主定义见 [`functional-inventory.md`](./functional-inventory.md)，`TBL-*` 主定义见 [`database-model.md`](./database-model.md)。

R=读取，C=新增，U=更新，D=删除。矩阵按功能维度聚合，数据源为各功能的实现主链（[`function-chain-index.md`](./function-chain-index.md)）。

## 1. 功能 × 物理表矩阵

| 功能 | 功能名 | 物理表 | R | C | U | D |
|---|---|---|---|---|---|---|
| FUNC-sys-login | 用户登录认证 | `sys_user` | 是 | - | - | - |
| FUNC-sys-login | 用户登录认证 | `sys_logininfor` | - | 是 | - | - |
| FUNC-sys-logout | 用户退出登录 | `sys_user_online` | - | - | - | 是 |
| FUNC-sys-logout | 用户退出登录 | `sys_logininfor` | - | 是 | - | - |
| FUNC-sys-captcha | 验证码生成 | （无） | - | - | - | - |
| FUNC-sys-register | 用户注册 | `sys_user` | - | 是 | - | - |
| FUNC-sys-index | 后台首页与工作台 | （无） | - | - | - | - |
| FUNC-sys-unauth | 未授权提示页 | （无） | - | - | - | - |
| FUNC-sys-profile | 个人中心维护 | `sys_user` | 是 | - | 是 | - |
| FUNC-sys-profile-avatar | 头像上传 | `sys_user` | - | - | 是 | - |
| FUNC-sys-user-manage | 用户管理 | `sys_user` | 是 | 是 | 是 | 是 |
| FUNC-sys-user-manage | 用户管理 | `sys_user_role` | 是 | 是 | - | 是 |
| FUNC-sys-user-manage | 用户管理 | `sys_user_post` | 是 | 是 | - | 是 |
| FUNC-sys-user-manage | 用户管理 | `sys_dept` | 是 | - | - | - |
| FUNC-sys-user-manage | 用户管理 | `sys_role` | 是 | - | - | - |
| FUNC-sys-user-manage | 用户管理 | `sys_post` | 是 | - | - | - |
| FUNC-sys-role-manage | 角色管理 | `sys_role` | 是 | 是 | 是 | 是 |
| FUNC-sys-role-manage | 角色管理 | `sys_role_menu` | 是 | 是 | - | 是 |
| FUNC-sys-role-manage | 角色管理 | `sys_role_dept` | 是 | 是 | - | 是 |
| FUNC-sys-role-manage | 角色管理 | `sys_user_role` | 是 | - | - | - |
| FUNC-sys-menu-manage | 菜单管理 | `sys_menu` | 是 | 是 | 是 | 是 |
| FUNC-sys-menu-manage | 菜单管理 | `sys_role_menu` | 是 | - | - | - |
| FUNC-sys-dept-manage | 部门管理 | `sys_dept` | 是 | 是 | 是 | 是 |
| FUNC-sys-dept-manage | 部门管理 | `sys_user` | 是 | - | - | - |
| FUNC-sys-post-manage | 岗位管理 | `sys_post` | 是 | 是 | 是 | 是 |
| FUNC-sys-post-manage | 岗位管理 | `sys_user_post` | 是 | - | - | - |
| FUNC-sys-dict-manage | 字典管理 | `sys_dict_type` | 是 | 是 | 是 | 是 |
| FUNC-sys-dict-manage | 字典管理 | `sys_dict_data` | 是 | 是 | 是 | 是 |
| FUNC-sys-config-manage | 参数设置 | `sys_config` | 是 | 是 | 是 | 是 |
| FUNC-sys-notice-manage | 通知公告 | `sys_notice` | 是 | 是 | 是 | 是 |
| FUNC-common-upload | 通用文件上传 | （无） | - | - | - | - |
| FUNC-common-download | 通用文件下载与资源读取 | （无） | - | - | - | - |
| FUNC-global-exception | 全局异常统一处理 | （无） | - | - | - | - |
| FUNC-open-app-manage | 应用管理 | `open_app` | 是 | 是 | 是 | 是 |
| FUNC-open-app-manage | 应用管理 | `open_app_api` | 是 | 是 | - | 是 |
| FUNC-open-app-manage | 应用管理 | `open_api` | 是 | - | - | - |
| FUNC-open-api-manage | 接口管理 | `open_api` | 是 | 是 | 是 | 是 |
| FUNC-open-api-manage | 接口管理 | `open_app_api` | 是 | - | - | - |
| FUNC-open-api-manage | 接口管理 | `open_api_doc` | 是 | - | - | - |
| FUNC-open-auth-manage | 授权管理 | `open_app_api` | 是 | 是 | 是 | 是 |
| FUNC-open-auth-manage | 授权管理 | `open_app` | 是 | - | - | - |
| FUNC-open-auth-manage | 授权管理 | `open_api` | 是 | - | - | - |
| FUNC-open-log-query | 调用日志查询 | `open_call_log` | 是 | - | - | - |
| FUNC-open-doc-manage | 文档管理 | `open_api_doc` | 是 | 是 | 是 | 是 |
| FUNC-open-doc-manage | 文档管理 | `open_api` | 是 | - | - | - |
| FUNC-open-gateway-invoke | 开放接口网关调用 | `open_app` | 是 | - | - | - |
| FUNC-open-gateway-invoke | 开放接口网关调用 | `open_api` | 是 | - | - | - |
| FUNC-open-gateway-invoke | 开放接口网关调用 | `open_app_api` | 是 | - | - | - |
| FUNC-open-gateway-invoke | 开放接口网关调用 | `open_call_log` | - | 是 | - | - |
| FUNC-open-selftest | 开放平台自检闭环 | `open_app` | - | 是 | - | - |
| FUNC-open-selftest | 开放平台自检闭环 | `open_api` | - | 是 | - | - |
| FUNC-open-selftest | 开放平台自检闭环 | `open_app_api` | - | 是 | - | - |
| FUNC-open-selftest | 开放平台自检闭环 | `open_call_log` | 是 | - | - | - |
| FUNC-job-manage | 定时任务管理 | `sys_job` | 是 | 是 | 是 | 是 |
| FUNC-job-scheduler | 定时任务调度执行 | `sys_job` | 是 | - | 是 | - |
| FUNC-job-scheduler | 定时任务调度执行 | `sys_job_log` | - | 是 | - | - |
| FUNC-job-scheduler | 定时任务调度执行 | `QRTZ_TRIGGERS` | 是 | - | - | - |
| FUNC-job-scheduler | 定时任务调度执行 | `QRTZ_JOB_DETAILS` | 是 | - | - | - |
| FUNC-job-log-query | 调度日志查询 | `sys_job_log` | 是 | - | - | 是 |

## 2. 物理表 × 功能矩阵（反向索引）

| 物理表 | 写入功能 | 读取功能 | 写入功能数 | 读取功能数 |
|---|---|---|---:|---:|
| `QRTZ_JOB_DETAILS` | - | FUNC-job-scheduler | 0 | 1 |
| `QRTZ_TRIGGERS` | - | FUNC-job-scheduler | 0 | 1 |
| `open_api` | FUNC-open-api-manage, FUNC-open-selftest | FUNC-open-app-manage, FUNC-open-api-manage, FUNC-open-auth-manage, FUNC-open-doc-manage, FUNC-open-gateway-invoke | 2 | 5 |
| `open_api_doc` | FUNC-open-doc-manage | FUNC-open-api-manage, FUNC-open-doc-manage | 1 | 2 |
| `open_app` | FUNC-open-app-manage, FUNC-open-selftest | FUNC-open-app-manage, FUNC-open-auth-manage, FUNC-open-gateway-invoke | 2 | 3 |
| `open_app_api` | FUNC-open-app-manage, FUNC-open-auth-manage, FUNC-open-selftest | FUNC-open-app-manage, FUNC-open-api-manage, FUNC-open-auth-manage, FUNC-open-gateway-invoke | 3 | 4 |
| `open_call_log` | FUNC-open-gateway-invoke | FUNC-open-log-query, FUNC-open-selftest | 1 | 2 |
| `sys_config` | FUNC-sys-config-manage | FUNC-sys-config-manage | 1 | 1 |
| `sys_dept` | FUNC-sys-dept-manage | FUNC-sys-user-manage, FUNC-sys-dept-manage | 1 | 2 |
| `sys_dict_data` | FUNC-sys-dict-manage | FUNC-sys-dict-manage | 1 | 1 |
| `sys_dict_type` | FUNC-sys-dict-manage | FUNC-sys-dict-manage | 1 | 1 |
| `sys_job` | FUNC-job-manage, FUNC-job-scheduler | FUNC-job-manage, FUNC-job-scheduler | 2 | 2 |
| `sys_job_log` | FUNC-job-scheduler, FUNC-job-log-query | FUNC-job-log-query | 2 | 1 |
| `sys_logininfor` | FUNC-sys-login, FUNC-sys-logout | - | 2 | 0 |
| `sys_menu` | FUNC-sys-menu-manage | FUNC-sys-menu-manage | 1 | 1 |
| `sys_notice` | FUNC-sys-notice-manage | FUNC-sys-notice-manage | 1 | 1 |
| `sys_post` | FUNC-sys-post-manage | FUNC-sys-user-manage, FUNC-sys-post-manage | 1 | 2 |
| `sys_role` | FUNC-sys-role-manage | FUNC-sys-user-manage, FUNC-sys-role-manage | 1 | 2 |
| `sys_role_dept` | FUNC-sys-role-manage | FUNC-sys-role-manage | 1 | 1 |
| `sys_role_menu` | FUNC-sys-role-manage | FUNC-sys-role-manage, FUNC-sys-menu-manage | 1 | 2 |
| `sys_user` | FUNC-sys-register, FUNC-sys-profile, FUNC-sys-profile-avatar, FUNC-sys-user-manage | FUNC-sys-login, FUNC-sys-profile, FUNC-sys-user-manage, FUNC-sys-dept-manage | 4 | 4 |
| `sys_user_online` | FUNC-sys-logout | - | 1 | 0 |
| `sys_user_post` | FUNC-sys-user-manage | FUNC-sys-user-manage, FUNC-sys-post-manage | 1 | 2 |
| `sys_user_role` | FUNC-sys-user-manage | FUNC-sys-user-manage, FUNC-sys-role-manage | 1 | 2 |

## 3. 无功能写入的物理表

| 物理表 | 说明 |
|---|---|
| `QRTZ_BLOB_TRIGGERS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_CALENDARS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_CRON_TRIGGERS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_FIRED_TRIGGERS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_LOCKS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_PAUSED_TRIGGER_GRPS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_SCHEDULER_STATE` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_SIMPLE_TRIGGERS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `QRTZ_SIMPROP_TRIGGERS` | Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入 |
| `sys_oper_log` | 仅由初始化 SQL 种子脚本写入，运行期无业务功能写入 |

## 4. Mapper 语句到表映射

| Mapper 文件 | 命名空间 | 语句 ID | 类型 |
|---|---|---|---|
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | com.qvsu.quartz.mapper.SysJobLogMapper | selectJobLogList | select |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | com.qvsu.quartz.mapper.SysJobLogMapper | selectJobLogAll | select |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | com.qvsu.quartz.mapper.SysJobLogMapper | selectJobLogById | select |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | com.qvsu.quartz.mapper.SysJobLogMapper | deleteJobLogById | delete |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | com.qvsu.quartz.mapper.SysJobLogMapper | deleteJobLogByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | com.qvsu.quartz.mapper.SysJobLogMapper | cleanJobLog | update |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | com.qvsu.quartz.mapper.SysJobLogMapper | insertJobLog | insert |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | com.qvsu.quartz.mapper.SysJobMapper | selectJobList | select |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | com.qvsu.quartz.mapper.SysJobMapper | selectJobAll | select |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | com.qvsu.quartz.mapper.SysJobMapper | selectJobById | select |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | com.qvsu.quartz.mapper.SysJobMapper | deleteJobById | delete |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | com.qvsu.quartz.mapper.SysJobMapper | deleteJobByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | com.qvsu.quartz.mapper.SysJobMapper | updateJob | update |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | com.qvsu.quartz.mapper.SysJobMapper | insertJob | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | selectConfig | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | selectConfigList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | selectConfigById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | checkConfigKeyUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | insertConfig | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | updateConfig | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | deleteConfigById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | com.qvsu.system.mapper.SysConfigMapper | deleteConfigByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | selectRoleDeptTree | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | selectDeptList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | checkDeptExistUser | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | selectDeptCount | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | checkDeptNameUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | selectDeptById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | selectChildrenDeptById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | selectNormalChildrenDeptById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | insertDept | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | updateDept | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | updateDeptChildren | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | deleteDeptById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | com.qvsu.system.mapper.SysDeptMapper | updateDeptStatusNormal | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | selectDictDataList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | selectDictDataByType | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | selectDictLabel | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | selectDictDataById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | countDictDataByType | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | deleteDictDataById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | deleteDictDataByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | updateDictData | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | updateDictDataType | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | com.qvsu.system.mapper.SysDictDataMapper | insertDictData | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | selectDictTypeList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | selectDictTypeAll | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | selectDictTypeById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | selectDictTypeByType | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | checkDictTypeUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | deleteDictTypeById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | deleteDictTypeByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | updateDictType | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | com.qvsu.system.mapper.SysDictTypeMapper | insertDictType | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysLogininforMapper.xml` | com.qvsu.system.mapper.SysLogininforMapper | insertLogininfor | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysLogininforMapper.xml` | com.qvsu.system.mapper.SysLogininforMapper | selectLogininforList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysLogininforMapper.xml` | com.qvsu.system.mapper.SysLogininforMapper | deleteLogininforByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysLogininforMapper.xml` | com.qvsu.system.mapper.SysLogininforMapper | cleanLogininfor | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenusByUserId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenuNormalAll | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenuAll | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenuAllByUserId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectPermsByUserId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectPermsByRoleId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenuTree | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenuList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenuListByUserId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | deleteMenuById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectMenuById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | selectCountMenuByParentId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | checkMenuNameUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | updateMenu | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | insertMenu | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | com.qvsu.system.mapper.SysMenuMapper | updateMenuSort | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysNoticeMapper.xml` | com.qvsu.system.mapper.SysNoticeMapper | selectNoticeById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysNoticeMapper.xml` | com.qvsu.system.mapper.SysNoticeMapper | selectNoticeList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysNoticeMapper.xml` | com.qvsu.system.mapper.SysNoticeMapper | insertNotice | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysNoticeMapper.xml` | com.qvsu.system.mapper.SysNoticeMapper | updateNotice | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysNoticeMapper.xml` | com.qvsu.system.mapper.SysNoticeMapper | deleteNoticeByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` | com.qvsu.system.mapper.SysOperLogMapper | insertOperlog | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` | com.qvsu.system.mapper.SysOperLogMapper | selectOperLogList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` | com.qvsu.system.mapper.SysOperLogMapper | deleteOperLogByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` | com.qvsu.system.mapper.SysOperLogMapper | selectOperLogById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` | com.qvsu.system.mapper.SysOperLogMapper | cleanOperLog | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | selectPostList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | selectPostAll | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | selectPostsByUserId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | selectPostById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | checkPostNameUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | checkPostCodeUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | deletePostByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | updatePost | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | com.qvsu.system.mapper.SysPostMapper | insertPost | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleDeptMapper.xml` | com.qvsu.system.mapper.SysRoleDeptMapper | deleteRoleDeptByRoleId | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleDeptMapper.xml` | com.qvsu.system.mapper.SysRoleDeptMapper | selectCountRoleDeptByDeptId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleDeptMapper.xml` | com.qvsu.system.mapper.SysRoleDeptMapper | deleteRoleDept | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleDeptMapper.xml` | com.qvsu.system.mapper.SysRoleDeptMapper | batchRoleDept | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | selectRoleList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | selectRolesByUserId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | selectRoleById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | checkRoleNameUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | checkRoleKeyUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | deleteRoleById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | deleteRoleByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | updateRole | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | com.qvsu.system.mapper.SysRoleMapper | insertRole | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMenuMapper.xml` | com.qvsu.system.mapper.SysRoleMenuMapper | deleteRoleMenuByRoleId | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMenuMapper.xml` | com.qvsu.system.mapper.SysRoleMenuMapper | selectCountRoleMenuByMenuId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMenuMapper.xml` | com.qvsu.system.mapper.SysRoleMenuMapper | deleteRoleMenu | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMenuMapper.xml` | com.qvsu.system.mapper.SysRoleMenuMapper | batchRoleMenu | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | selectUserList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | selectAllocatedList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | selectUnallocatedList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | selectUserByLoginName | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | selectUserByPhoneNumber | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | selectUserByEmail | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | checkLoginNameUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | checkPhoneUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | checkEmailUnique | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | selectUserById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | deleteUserById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | deleteUserByIds | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | updateUserAvatar | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | resetUserPwd | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | updateUserStatus | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | updateLoginInfo | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | updateUser | update |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | com.qvsu.system.mapper.SysUserMapper | insertUser | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserOnlineMapper.xml` | com.qvsu.system.mapper.SysUserOnlineMapper | selectOnlineById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserOnlineMapper.xml` | com.qvsu.system.mapper.SysUserOnlineMapper | saveOnline | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserOnlineMapper.xml` | com.qvsu.system.mapper.SysUserOnlineMapper | deleteOnlineById | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserOnlineMapper.xml` | com.qvsu.system.mapper.SysUserOnlineMapper | selectUserOnlineList | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserOnlineMapper.xml` | com.qvsu.system.mapper.SysUserOnlineMapper | selectOnlineByExpired | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserPostMapper.xml` | com.qvsu.system.mapper.SysUserPostMapper | deleteUserPostByUserId | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserPostMapper.xml` | com.qvsu.system.mapper.SysUserPostMapper | countUserPostById | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserPostMapper.xml` | com.qvsu.system.mapper.SysUserPostMapper | deleteUserPost | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserPostMapper.xml` | com.qvsu.system.mapper.SysUserPostMapper | batchUserPost | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | com.qvsu.system.mapper.SysUserRoleMapper | selectUserRoleByUserId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | com.qvsu.system.mapper.SysUserRoleMapper | deleteUserRoleByUserId | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | com.qvsu.system.mapper.SysUserRoleMapper | countUserRoleByRoleId | select |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | com.qvsu.system.mapper.SysUserRoleMapper | deleteUserRole | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | com.qvsu.system.mapper.SysUserRoleMapper | batchUserRole | insert |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | com.qvsu.system.mapper.SysUserRoleMapper | deleteUserRoleInfo | delete |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | com.qvsu.system.mapper.SysUserRoleMapper | deleteUserRoleInfos | delete |

## 5. 相关文档

- 表关系与血缘：[`database-relations.md`](./database-relations.md)
- 数据归属与冲突：[`data-ownership.md`](./data-ownership.md)
- 逐字段设计：[`database-schema.md`](./database-schema.md)
