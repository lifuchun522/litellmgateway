# 接口清单（Interface Index）

> 产物语言：zh-CN ｜ 本文件是全部 `API-*` 与 `JOB-*` 稳定 ID 的**唯一主定义位置**。

共 192 个接口节点：184 个 HTTP 端点（来自 24 个 Controller 的注解扫描）+ 8 个非端点型接口（网关聚合入口、全局异常、Quartz 调度入口、由框架或未纳入扫描的控制器提供的监控接口）。

## 0. 接口总览

| 接口 ID | 类型 | 方向 | 协议标识 | 提供者 | 消费者功能 |
|---|---|---|---|---|---|
| API-CommonController-fileDownload | REST | inbound | GET /common/download | CommonController | FUNC-common-upload, FUNC-common-download |
| API-CommonController-uploadFile | REST | inbound | POST /common/upload | CommonController | FUNC-common-upload, FUNC-common-download |
| API-CommonController-uploadFiles | REST | inbound | POST /common/uploads | CommonController | FUNC-common-upload, FUNC-common-download |
| API-CommonController-resourceDownload | REST | inbound | GET /common/download/resource | CommonController | FUNC-common-upload, FUNC-common-download |
| API-OpenApiMgrController-list | REST | inbound | POST /admin/open/api/list | OpenApiMgrController | FUNC-open-api-manage |
| API-OpenApiMgrController-curl | REST | inbound | GET /admin/open/api/curl/{id} | OpenApiMgrController | FUNC-open-api-manage |
| API-OpenApiMgrController-add | REST | inbound | GET /admin/open/api/add | OpenApiMgrController | FUNC-open-api-manage |
| API-OpenApiMgrController-addSave | REST | inbound | POST /admin/open/api/add | OpenApiMgrController | FUNC-open-api-manage |
| API-OpenApiMgrController-edit | REST | inbound | GET /admin/open/api/edit/{id} | OpenApiMgrController | FUNC-open-api-manage |
| API-OpenApiMgrController-editSave | REST | inbound | POST /admin/open/api/edit | OpenApiMgrController | FUNC-open-api-manage |
| API-OpenApiMgrController-remove | REST | inbound | POST /admin/open/api/remove | OpenApiMgrController | FUNC-open-api-manage |
| API-OpenAppController-list | REST | inbound | POST /admin/open/app/list | OpenAppController | FUNC-open-app-manage |
| API-OpenAppController-add | REST | inbound | GET /admin/open/app/add | OpenAppController | FUNC-open-app-manage |
| API-OpenAppController-addSave | REST | inbound | POST /admin/open/app/add | OpenAppController | FUNC-open-app-manage |
| API-OpenAppController-edit | REST | inbound | GET /admin/open/app/edit/{id} | OpenAppController | FUNC-open-app-manage |
| API-OpenAppController-editSave | REST | inbound | POST /admin/open/app/edit | OpenAppController | FUNC-open-app-manage |
| API-OpenAppController-remove | REST | inbound | POST /admin/open/app/remove | OpenAppController | FUNC-open-app-manage |
| API-OpenAppController-resetSecret | REST | inbound | POST /admin/open/app/resetSecret | OpenAppController | FUNC-open-app-manage |
| API-OpenAuthController-apps | REST | inbound | GET /admin/open/auth/apps | OpenAuthController | FUNC-open-auth-manage |
| API-OpenAuthController-apis | REST | inbound | GET /admin/open/auth/apis | OpenAuthController | FUNC-open-auth-manage |
| API-OpenAuthController-apiIds | REST | inbound | GET /admin/open/auth/apiIds | OpenAuthController | FUNC-open-auth-manage |
| API-OpenAuthController-save | REST | inbound | POST /admin/open/auth/save | OpenAuthController | FUNC-open-auth-manage |
| API-OpenDocController-apis | REST | inbound | GET /admin/open/doc/apis | OpenDocController | FUNC-open-doc-manage |
| API-OpenDocController-html | REST | inbound | GET /admin/open/doc/html/{apiId} | OpenDocController | FUNC-open-doc-manage |
| API-OpenDocController-list | REST | inbound | GET /admin/open/doc/list | OpenDocController | FUNC-open-doc-manage |
| API-OpenDocController-generate | REST | inbound | POST /admin/open/doc/generate | OpenDocController | FUNC-open-doc-manage |
| API-OpenDocController-download | REST | inbound | GET /admin/open/doc/download | OpenDocController | FUNC-open-doc-manage |
| API-OpenLogController-list | REST | inbound | POST /admin/open/log/list | OpenLogController | FUNC-open-log-query |
| API-OpenLogController-stats | REST | inbound | GET /admin/open/log/stats | OpenLogController | FUNC-open-log-query |
| API-OpenLogController-exportCsv | REST | inbound | GET /admin/open/log/exportCsv | OpenLogController | FUNC-open-log-query |
| API-OpenSelftestHttpbinController-get | REST | inbound | GET /selftest/httpbin/get | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-post | REST | inbound | POST /selftest/httpbin/post | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-put | REST | inbound | PUT /selftest/httpbin/put | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-delete | REST | inbound | DELETE /selftest/httpbin/delete | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-headers | REST | inbound | GET /selftest/httpbin/headers | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-ip | REST | inbound | GET /selftest/httpbin/ip | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-userAgent | REST | inbound | GET /selftest/httpbin/user-agent | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-uuid | REST | inbound | GET /selftest/httpbin/uuid | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-OpenSelftestHttpbinController-timeout | REST | inbound | GET /selftest/httpbin/timeout | OpenSelftestHttpbinController | FUNC-open-selftest |
| API-SysCaptchaController-getKaptchaImage | REST | inbound | GET /captcha/captchaImage | SysCaptchaController | FUNC-sys-captcha |
| API-SysCaptchaController-captchaCode | REST | inbound | GET /captcha/captchaCode | SysCaptchaController | FUNC-sys-captcha |
| API-SysConfigController-list | REST | inbound | POST /system/config/list | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-export | REST | inbound | POST /system/config/export | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-add | REST | inbound | GET /system/config/add | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-addSave | REST | inbound | POST /system/config/add | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-edit | REST | inbound | GET /system/config/edit/{configId} | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-editSave | REST | inbound | POST /system/config/edit | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-remove | REST | inbound | POST /system/config/remove | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-refreshCache | REST | inbound | GET /system/config/refreshCache | SysConfigController | FUNC-sys-config-manage |
| API-SysConfigController-checkConfigKeyUnique | REST | inbound | POST /system/config/checkConfigKeyUnique | SysConfigController | FUNC-sys-config-manage |
| API-SysDeptController-list | REST | inbound | POST /system/dept/list | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-add | REST | inbound | GET /system/dept/add/{parentId} | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-addSave | REST | inbound | POST /system/dept/add | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-edit | REST | inbound | GET /system/dept/edit/{deptId} | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-editSave | REST | inbound | POST /system/dept/edit | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-remove | REST | inbound | GET /system/dept/remove/{deptId} | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-checkDeptNameUnique | REST | inbound | POST /system/dept/checkDeptNameUnique | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-selectDeptTree | REST | inbound | GET /system/dept/selectDeptTree/{deptId} | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-selectDeptTree-2 | REST | inbound | GET /system/dept/selectDeptTree/{deptId}/{excludeId} | SysDeptController | FUNC-sys-dept-manage |
| API-SysDeptController-treeDataExcludeChild | REST | inbound | GET /system/dept/treeData/{excludeId} | SysDeptController | FUNC-sys-dept-manage |
| API-SysDictDataController-list | REST | inbound | POST /system/dict/data/list | SysDictDataController | FUNC-sys-dict-manage |
| API-SysDictDataController-export | REST | inbound | POST /system/dict/data/export | SysDictDataController | FUNC-sys-dict-manage |
| API-SysDictDataController-add | REST | inbound | GET /system/dict/data/add/{dictType} | SysDictDataController | FUNC-sys-dict-manage |
| API-SysDictDataController-addSave | REST | inbound | POST /system/dict/data/add | SysDictDataController | FUNC-sys-dict-manage |
| API-SysDictDataController-edit | REST | inbound | GET /system/dict/data/edit/{dictCode} | SysDictDataController | FUNC-sys-dict-manage |
| API-SysDictDataController-editSave | REST | inbound | POST /system/dict/data/edit | SysDictDataController | FUNC-sys-dict-manage |
| API-SysDictDataController-remove | REST | inbound | POST /system/dict/data/remove | SysDictDataController | FUNC-sys-dict-manage |
| API-SysDictTypeController-list | REST | inbound | POST /system/dict/list | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-export | REST | inbound | POST /system/dict/export | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-add | REST | inbound | GET /system/dict/add | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-addSave | REST | inbound | POST /system/dict/add | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-edit | REST | inbound | GET /system/dict/edit/{dictId} | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-editSave | REST | inbound | POST /system/dict/edit | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-remove | REST | inbound | POST /system/dict/remove | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-refreshCache | REST | inbound | GET /system/dict/refreshCache | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-detail | REST | inbound | GET /system/dict/detail/{dictId} | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-checkDictTypeUnique | REST | inbound | POST /system/dict/checkDictTypeUnique | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-selectDictTree | REST | inbound | GET /system/dict/selectDictTree/{columnId}/{dictType} | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysDictTypeController-treeData | REST | inbound | GET /system/dict/treeData | SysDictTypeController | FUNC-sys-dict-manage |
| API-SysIndexController-index | REST | inbound | GET /index | SysIndexController | FUNC-sys-index, FUNC-sys-unauth |
| API-SysIndexController-lockscreen | REST | inbound | GET /lockscreen | SysIndexController | FUNC-sys-index, FUNC-sys-unauth |
| API-SysIndexController-unlockscreen | REST | inbound | POST /unlockscreen | SysIndexController | FUNC-sys-index, FUNC-sys-unauth |
| API-SysIndexController-switchSkin | REST | inbound | GET /system/switchSkin | SysIndexController | FUNC-sys-index, FUNC-sys-unauth |
| API-SysIndexController-menuStyle | REST | inbound | GET /system/menuStyle/{style} | SysIndexController | FUNC-sys-index, FUNC-sys-unauth |
| API-SysIndexController-main | REST | inbound | GET /system/main | SysIndexController | FUNC-sys-index, FUNC-sys-unauth |
| API-SysJobController-list | REST | inbound | POST /monitor/job/list | SysJobController | FUNC-job-manage |
| API-SysJobController-export | REST | inbound | POST /monitor/job/export | SysJobController | FUNC-job-manage |
| API-SysJobController-remove | REST | inbound | POST /monitor/job/remove | SysJobController | FUNC-job-manage |
| API-SysJobController-detail | REST | inbound | GET /monitor/job/detail/{jobId} | SysJobController | FUNC-job-manage |
| API-SysJobController-changeStatus | REST | inbound | POST /monitor/job/changeStatus | SysJobController | FUNC-job-manage |
| API-SysJobController-run | REST | inbound | POST /monitor/job/run | SysJobController | FUNC-job-manage |
| API-SysJobController-add | REST | inbound | GET /monitor/job/add | SysJobController | FUNC-job-manage |
| API-SysJobController-addSave | REST | inbound | POST /monitor/job/add | SysJobController | FUNC-job-manage |
| API-SysJobController-edit | REST | inbound | GET /monitor/job/edit/{jobId} | SysJobController | FUNC-job-manage |
| API-SysJobController-editSave | REST | inbound | POST /monitor/job/edit | SysJobController | FUNC-job-manage |
| API-SysJobController-checkCronExpressionIsValid | REST | inbound | POST /monitor/job/checkCronExpressionIsValid | SysJobController | FUNC-job-manage |
| API-SysJobController-cron | REST | inbound | GET /monitor/job/cron | SysJobController | FUNC-job-manage |
| API-SysJobController-queryCronExpression | REST | inbound | GET /monitor/job/queryCronExpression | SysJobController | FUNC-job-manage |
| API-SysJobLogController-list | REST | inbound | POST /monitor/jobLog/list | SysJobLogController | FUNC-job-log-query |
| API-SysJobLogController-export | REST | inbound | POST /monitor/jobLog/export | SysJobLogController | FUNC-job-log-query |
| API-SysJobLogController-remove | REST | inbound | POST /monitor/jobLog/remove | SysJobLogController | FUNC-job-log-query |
| API-SysJobLogController-detail | REST | inbound | GET /monitor/jobLog/detail/{jobLogId} | SysJobLogController | FUNC-job-log-query |
| API-SysJobLogController-clean | REST | inbound | POST /monitor/jobLog/clean | SysJobLogController | FUNC-job-log-query |
| API-SysLoginController-login | REST | inbound | GET /login | SysLoginController | FUNC-sys-login, FUNC-sys-logout |
| API-SysLoginController-ajaxLogin | REST | inbound | POST /login | SysLoginController | FUNC-sys-login, FUNC-sys-logout |
| API-SysLoginController-unauth | REST | inbound | GET /unauth | SysLoginController | FUNC-sys-login, FUNC-sys-logout |
| API-SysMenuController-list | REST | inbound | POST /system/menu/list | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-remove | REST | inbound | GET /system/menu/remove/{menuId} | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-add | REST | inbound | GET /system/menu/add/{parentId} | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-addSave | REST | inbound | POST /system/menu/add | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-edit | REST | inbound | GET /system/menu/edit/{menuId} | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-editSave | REST | inbound | POST /system/menu/edit | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-updateSort | REST | inbound | POST /system/menu/updateSort | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-icon | REST | inbound | GET /system/menu/icon | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-checkMenuNameUnique | REST | inbound | POST /system/menu/checkMenuNameUnique | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-roleMenuTreeData | REST | inbound | GET /system/menu/roleMenuTreeData | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-menuTreeData | REST | inbound | GET /system/menu/menuTreeData | SysMenuController | FUNC-sys-menu-manage |
| API-SysMenuController-selectMenuTree | REST | inbound | GET /system/menu/selectMenuTree/{menuId} | SysMenuController | FUNC-sys-menu-manage |
| API-SysNoticeController-list | REST | inbound | POST /system/notice/list | SysNoticeController | FUNC-sys-notice-manage |
| API-SysNoticeController-add | REST | inbound | GET /system/notice/add | SysNoticeController | FUNC-sys-notice-manage |
| API-SysNoticeController-addSave | REST | inbound | POST /system/notice/add | SysNoticeController | FUNC-sys-notice-manage |
| API-SysNoticeController-edit | REST | inbound | GET /system/notice/edit/{noticeId} | SysNoticeController | FUNC-sys-notice-manage |
| API-SysNoticeController-editSave | REST | inbound | POST /system/notice/edit | SysNoticeController | FUNC-sys-notice-manage |
| API-SysNoticeController-view | REST | inbound | GET /system/notice/view/{noticeId} | SysNoticeController | FUNC-sys-notice-manage |
| API-SysNoticeController-remove | REST | inbound | POST /system/notice/remove | SysNoticeController | FUNC-sys-notice-manage |
| API-SysPostController-list | REST | inbound | POST /system/post/list | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-export | REST | inbound | POST /system/post/export | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-remove | REST | inbound | POST /system/post/remove | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-add | REST | inbound | GET /system/post/add | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-addSave | REST | inbound | POST /system/post/add | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-edit | REST | inbound | GET /system/post/edit/{postId} | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-editSave | REST | inbound | POST /system/post/edit | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-checkPostNameUnique | REST | inbound | POST /system/post/checkPostNameUnique | SysPostController | FUNC-sys-post-manage |
| API-SysPostController-checkPostCodeUnique | REST | inbound | POST /system/post/checkPostCodeUnique | SysPostController | FUNC-sys-post-manage |
| API-SysProfileController-checkPassword | REST | inbound | GET /system/user/profile/checkPassword | SysProfileController | FUNC-sys-profile, FUNC-sys-profile-avatar |
| API-SysProfileController-resetPwd | REST | inbound | GET /system/user/profile/resetPwd | SysProfileController | FUNC-sys-profile, FUNC-sys-profile-avatar |
| API-SysProfileController-resetPwd-2 | REST | inbound | POST /system/user/profile/resetPwd | SysProfileController | FUNC-sys-profile, FUNC-sys-profile-avatar |
| API-SysProfileController-edit | REST | inbound | GET /system/user/profile/edit | SysProfileController | FUNC-sys-profile, FUNC-sys-profile-avatar |
| API-SysProfileController-avatar | REST | inbound | GET /system/user/profile/avatar | SysProfileController | FUNC-sys-profile, FUNC-sys-profile-avatar |
| API-SysProfileController-update | REST | inbound | POST /system/user/profile/update | SysProfileController | FUNC-sys-profile, FUNC-sys-profile-avatar |
| API-SysProfileController-updateAvatar | REST | inbound | POST /system/user/profile/updateAvatar | SysProfileController | FUNC-sys-profile, FUNC-sys-profile-avatar |
| API-SysRegisterController-register | REST | inbound | GET /register | SysRegisterController | FUNC-sys-register |
| API-SysRegisterController-ajaxRegister | REST | inbound | POST /register | SysRegisterController | FUNC-sys-register |
| API-SysRoleController-list | REST | inbound | POST /system/role/list | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-export | REST | inbound | POST /system/role/export | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-add | REST | inbound | GET /system/role/add | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-addSave | REST | inbound | POST /system/role/add | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-edit | REST | inbound | GET /system/role/edit/{roleId} | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-editSave | REST | inbound | POST /system/role/edit | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-authDataScope | REST | inbound | GET /system/role/authDataScope/{roleId} | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-authDataScopeSave | REST | inbound | POST /system/role/authDataScope | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-remove | REST | inbound | POST /system/role/remove | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-checkRoleNameUnique | REST | inbound | POST /system/role/checkRoleNameUnique | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-checkRoleKeyUnique | REST | inbound | POST /system/role/checkRoleKeyUnique | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-selectMenuTree | REST | inbound | GET /system/role/selectMenuTree | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-changeStatus | REST | inbound | POST /system/role/changeStatus | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-authUser | REST | inbound | GET /system/role/authUser/{roleId} | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-allocatedList | REST | inbound | POST /system/role/authUser/allocatedList | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-cancelAuthUser | REST | inbound | POST /system/role/authUser/cancel | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-cancelAuthUserAll | REST | inbound | POST /system/role/authUser/cancelAll | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-selectUser | REST | inbound | GET /system/role/authUser/selectUser/{roleId} | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-unallocatedList | REST | inbound | POST /system/role/authUser/unallocatedList | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-selectAuthUserAll | REST | inbound | POST /system/role/authUser/selectAll | SysRoleController | FUNC-sys-role-manage |
| API-SysRoleController-deptTreeData | REST | inbound | GET /system/role/deptTreeData | SysRoleController | FUNC-sys-role-manage |
| API-SysUserController-list | REST | inbound | POST /system/user/list | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-export | REST | inbound | POST /system/user/export | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-importData | REST | inbound | POST /system/user/importData | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-importTemplate | REST | inbound | GET /system/user/importTemplate | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-add | REST | inbound | GET /system/user/add | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-addSave | REST | inbound | POST /system/user/add | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-edit | REST | inbound | GET /system/user/edit/{userId} | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-view | REST | inbound | GET /system/user/view/{userId} | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-editSave | REST | inbound | POST /system/user/edit | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-resetPwd | REST | inbound | GET /system/user/resetPwd/{userId} | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-resetPwdSave | REST | inbound | POST /system/user/resetPwd | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-authRole | REST | inbound | GET /system/user/authRole/{userId} | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-insertAuthRole | REST | inbound | POST /system/user/authRole/insertAuthRole | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-remove | REST | inbound | POST /system/user/remove | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-checkLoginNameUnique | REST | inbound | POST /system/user/checkLoginNameUnique | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-checkPhoneUnique | REST | inbound | POST /system/user/checkPhoneUnique | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-checkEmailUnique | REST | inbound | POST /system/user/checkEmailUnique | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-changeStatus | REST | inbound | POST /system/user/changeStatus | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-deptTreeData | REST | inbound | GET /system/user/deptTreeData | SysUserController | FUNC-sys-user-manage |
| API-SysUserController-selectDeptTree | REST | inbound | GET /system/user/selectDeptTree/{deptId} | SysUserController | FUNC-sys-user-manage |
| API-open-gateway | REST | inbound | ALL /open/**（具体前缀由 OpenGatewayController 与其过滤器决定） | com.qvsu.open.controller.OpenGatewayController + com.qvsu.open.filter | FUNC-open-gateway-invoke |
| API-global-exception | INTERNAL | internal | @ControllerAdvice 全局异常拦截 | com.qvsu.framework.web.exception.GlobalExceptionHandler | FUNC-global-exception |
| API-common-upload | REST | inbound | POST /common/upload | com.qvsu.web.controller.common.CommonController | FUNC-common-upload |
| API-common-download | REST | inbound | GET /common/download、GET /common/download/resource | com.qvsu.web.controller.common.CommonController | FUNC-common-download |
| API-captcha-image | REST | inbound | GET /captcha/captchaImage | com.qvsu.web.controller.system.SysCaptchaController | FUNC-sys-captcha |
| API-open-selftest-echo | REST | internal | GET/POST/PUT/DELETE /selftest/httpbin/** | com.qvsu.open.controller.OpenSelftestHttpbinController | FUNC-open-selftest |
| API-joblog-list | REST | inbound | POST /monitor/jobLog/list（由 SysJobLogController 提供） | com.qvsu.quartz.controller.SysJobLogController | FUNC-job-log-query |
| JOB-quartz-dispatch | BATCH | internal | Quartz 调度器按 Cron 触发，反射调用 sys_job.invoke_target | com.qvsu.quartz.config + com.qvsu.quartz.service.impl.SysJobServiceImpl | FUNC-job-scheduler |

## 1. HTTP 端点主定义

## API-CommonController-fileDownload - GET /common/download

- ID: API-CommonController-fileDownload
- 类型: REST
- 方向: inbound
- 协议标识: GET /common/download
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `CommonController.fileDownload`
- 消费者功能: FUNC-common-upload, FUNC-common-download
- Controller/Provider/Consumer/Client: CommonController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（文件系统）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `@@GetMapping("/download")`

## API-CommonController-uploadFile - POST /common/upload

- ID: API-CommonController-uploadFile
- 类型: REST
- 方向: inbound
- 协议标识: POST /common/upload
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `CommonController.uploadFile`
- 消费者功能: FUNC-common-upload, FUNC-common-download
- Controller/Provider/Consumer/Client: CommonController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（文件系统）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `@@PostMapping("/upload")`

## API-CommonController-uploadFiles - POST /common/uploads

- ID: API-CommonController-uploadFiles
- 类型: REST
- 方向: inbound
- 协议标识: POST /common/uploads
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `CommonController.uploadFiles`
- 消费者功能: FUNC-common-upload, FUNC-common-download
- Controller/Provider/Consumer/Client: CommonController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（文件系统）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `@@PostMapping("/uploads")`

## API-CommonController-resourceDownload - GET /common/download/resource

- ID: API-CommonController-resourceDownload
- 类型: REST
- 方向: inbound
- 协议标识: GET /common/download/resource
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `CommonController.resourceDownload`
- 消费者功能: FUNC-common-upload, FUNC-common-download
- Controller/Provider/Consumer/Client: CommonController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（文件系统）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` 的 `@@GetMapping("/download/resource")`

## API-OpenApiMgrController-list - POST /admin/open/api/list

- ID: API-OpenApiMgrController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/api/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `OpenApiMgrController.list`
- 消费者功能: FUNC-open-api-manage
- Controller/Provider/Consumer/Client: OpenApiMgrController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `@@PostMapping("/list")`

## API-OpenApiMgrController-curl - GET /admin/open/api/curl/{id}

- ID: API-OpenApiMgrController-curl
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/api/curl/{id}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `OpenApiMgrController.curl`
- 消费者功能: FUNC-open-api-manage
- Controller/Provider/Consumer/Client: OpenApiMgrController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `@@GetMapping("/curl/{id}")`

## API-OpenApiMgrController-add - GET /admin/open/api/add

- ID: API-OpenApiMgrController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/api/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `OpenApiMgrController.add`
- 消费者功能: FUNC-open-api-manage
- Controller/Provider/Consumer/Client: OpenApiMgrController
- 请求对象: 表单参数或同名实体（OpenApiMgr）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `@@GetMapping("/add")`

## API-OpenApiMgrController-addSave - POST /admin/open/api/add

- ID: API-OpenApiMgrController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/api/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `OpenApiMgrController.addSave`
- 消费者功能: FUNC-open-api-manage
- Controller/Provider/Consumer/Client: OpenApiMgrController
- 请求对象: 表单参数或同名实体（OpenApiMgr）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `@@PostMapping("/add")`

## API-OpenApiMgrController-edit - GET /admin/open/api/edit/{id}

- ID: API-OpenApiMgrController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/api/edit/{id}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `OpenApiMgrController.edit`
- 消费者功能: FUNC-open-api-manage
- Controller/Provider/Consumer/Client: OpenApiMgrController
- 请求对象: 表单参数或同名实体（OpenApiMgr）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `@@GetMapping("/edit/{id}")`

## API-OpenApiMgrController-editSave - POST /admin/open/api/edit

- ID: API-OpenApiMgrController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/api/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `OpenApiMgrController.editSave`
- 消费者功能: FUNC-open-api-manage
- Controller/Provider/Consumer/Client: OpenApiMgrController
- 请求对象: 表单参数或同名实体（OpenApiMgr）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `@@PostMapping("/edit")`

## API-OpenApiMgrController-remove - POST /admin/open/api/remove

- ID: API-OpenApiMgrController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/api/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `OpenApiMgrController.remove`
- 消费者功能: FUNC-open-api-manage
- Controller/Provider/Consumer/Client: OpenApiMgrController
- 请求对象: 表单参数或同名实体（OpenApiMgr）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` 的 `@@PostMapping("/remove")`

## API-OpenAppController-list - POST /admin/open/app/list

- ID: API-OpenAppController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/app/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `OpenAppController.list`
- 消费者功能: FUNC-open-app-manage
- Controller/Provider/Consumer/Client: OpenAppController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app（R/C/U/D）、open_app_api（R/C/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `@@PostMapping("/list")`

## API-OpenAppController-add - GET /admin/open/app/add

- ID: API-OpenAppController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/app/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `OpenAppController.add`
- 消费者功能: FUNC-open-app-manage
- Controller/Provider/Consumer/Client: OpenAppController
- 请求对象: 表单参数或同名实体（OpenApp）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app（R/C/U/D）、open_app_api（R/C/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `@@GetMapping("/add")`

## API-OpenAppController-addSave - POST /admin/open/app/add

- ID: API-OpenAppController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/app/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `OpenAppController.addSave`
- 消费者功能: FUNC-open-app-manage
- Controller/Provider/Consumer/Client: OpenAppController
- 请求对象: 表单参数或同名实体（OpenApp）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app（R/C/U/D）、open_app_api（R/C/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `@@PostMapping("/add")`

## API-OpenAppController-edit - GET /admin/open/app/edit/{id}

- ID: API-OpenAppController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/app/edit/{id}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `OpenAppController.edit`
- 消费者功能: FUNC-open-app-manage
- Controller/Provider/Consumer/Client: OpenAppController
- 请求对象: 表单参数或同名实体（OpenApp）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app（R/C/U/D）、open_app_api（R/C/D）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `@@GetMapping("/edit/{id}")`

## API-OpenAppController-editSave - POST /admin/open/app/edit

- ID: API-OpenAppController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/app/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `OpenAppController.editSave`
- 消费者功能: FUNC-open-app-manage
- Controller/Provider/Consumer/Client: OpenAppController
- 请求对象: 表单参数或同名实体（OpenApp）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app（R/C/U/D）、open_app_api（R/C/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `@@PostMapping("/edit")`

## API-OpenAppController-remove - POST /admin/open/app/remove

- ID: API-OpenAppController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/app/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `OpenAppController.remove`
- 消费者功能: FUNC-open-app-manage
- Controller/Provider/Consumer/Client: OpenAppController
- 请求对象: 表单参数或同名实体（OpenApp）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app（R/C/U/D）、open_app_api（R/C/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `@@PostMapping("/remove")`

## API-OpenAppController-resetSecret - POST /admin/open/app/resetSecret

- ID: API-OpenAppController-resetSecret
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/app/resetSecret
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `OpenAppController.resetSecret`
- 消费者功能: FUNC-open-app-manage
- Controller/Provider/Consumer/Client: OpenAppController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app（R/C/U/D）、open_app_api（R/C/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` 的 `@@PostMapping("/resetSecret")`

## API-OpenAuthController-apps - GET /admin/open/auth/apps

- ID: API-OpenAuthController-apps
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/auth/apps
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `OpenAuthController.apps`
- 消费者功能: FUNC-open-auth-manage
- Controller/Provider/Consumer/Client: OpenAuthController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app_api（R/C/U/D）、open_app（R）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `@@GetMapping("/apps")`

## API-OpenAuthController-apis - GET /admin/open/auth/apis

- ID: API-OpenAuthController-apis
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/auth/apis
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `OpenAuthController.apis`
- 消费者功能: FUNC-open-auth-manage
- Controller/Provider/Consumer/Client: OpenAuthController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app_api（R/C/U/D）、open_app（R）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `@@GetMapping("/apis")`

## API-OpenAuthController-apiIds - GET /admin/open/auth/apiIds

- ID: API-OpenAuthController-apiIds
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/auth/apiIds
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `OpenAuthController.apiIds`
- 消费者功能: FUNC-open-auth-manage
- Controller/Provider/Consumer/Client: OpenAuthController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app_api（R/C/U/D）、open_app（R）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `@@GetMapping("/apiIds")`

## API-OpenAuthController-save - POST /admin/open/auth/save

- ID: API-OpenAuthController-save
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/auth/save
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `OpenAuthController.save`
- 消费者功能: FUNC-open-auth-manage
- Controller/Provider/Consumer/Client: OpenAuthController
- 请求对象: 表单参数或同名实体（OpenAuth）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_app_api（R/C/U/D）、open_app（R）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` 的 `@@PostMapping("/save")`

## API-OpenDocController-apis - GET /admin/open/doc/apis

- ID: API-OpenDocController-apis
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/doc/apis
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `OpenDocController.apis`
- 消费者功能: FUNC-open-doc-manage
- Controller/Provider/Consumer/Client: OpenDocController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api_doc（R/C/U/D）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `@@GetMapping("/apis")`

## API-OpenDocController-html - GET /admin/open/doc/html/{apiId}

- ID: API-OpenDocController-html
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/doc/html/{apiId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `OpenDocController.html`
- 消费者功能: FUNC-open-doc-manage
- Controller/Provider/Consumer/Client: OpenDocController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api_doc（R/C/U/D）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `@@GetMapping("/html/{apiId}")`

## API-OpenDocController-list - GET /admin/open/doc/list

- ID: API-OpenDocController-list
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/doc/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `OpenDocController.list`
- 消费者功能: FUNC-open-doc-manage
- Controller/Provider/Consumer/Client: OpenDocController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api_doc（R/C/U/D）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `@@GetMapping("/list")`

## API-OpenDocController-generate - POST /admin/open/doc/generate

- ID: API-OpenDocController-generate
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/doc/generate
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `OpenDocController.generate`
- 消费者功能: FUNC-open-doc-manage
- Controller/Provider/Consumer/Client: OpenDocController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api_doc（R/C/U/D）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `@@PostMapping("/generate")`

## API-OpenDocController-download - GET /admin/open/doc/download

- ID: API-OpenDocController-download
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/doc/download
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `OpenDocController.download`
- 消费者功能: FUNC-open-doc-manage
- Controller/Provider/Consumer/Client: OpenDocController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_api_doc（R/C/U/D）、open_api（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` 的 `@@GetMapping("/download")`

## API-OpenLogController-list - POST /admin/open/log/list

- ID: API-OpenLogController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /admin/open/log/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` 的 `OpenLogController.list`
- 消费者功能: FUNC-open-log-query
- Controller/Provider/Consumer/Client: OpenLogController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_call_log（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` 的 `@@PostMapping("/list")`

## API-OpenLogController-stats - GET /admin/open/log/stats

- ID: API-OpenLogController-stats
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/log/stats
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` 的 `OpenLogController.stats`
- 消费者功能: FUNC-open-log-query
- Controller/Provider/Consumer/Client: OpenLogController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_call_log（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` 的 `@@GetMapping("/stats")`

## API-OpenLogController-exportCsv - GET /admin/open/log/exportCsv

- ID: API-OpenLogController-exportCsv
- 类型: REST
- 方向: inbound
- 协议标识: GET /admin/open/log/exportCsv
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` 的 `OpenLogController.exportCsv`
- 消费者功能: FUNC-open-log-query
- Controller/Provider/Consumer/Client: OpenLogController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: open_call_log（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` 的 `@@GetMapping("/exportCsv")`

## API-OpenSelftestHttpbinController-get - GET /selftest/httpbin/get

- ID: API-OpenSelftestHttpbinController-get
- 类型: REST
- 方向: inbound
- 协议标识: GET /selftest/httpbin/get
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.get`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@GetMapping("/selftest/httpbin/get")`

## API-OpenSelftestHttpbinController-post - POST /selftest/httpbin/post

- ID: API-OpenSelftestHttpbinController-post
- 类型: REST
- 方向: inbound
- 协议标识: POST /selftest/httpbin/post
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.post`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@PostMapping("/selftest/httpbin/post")`

## API-OpenSelftestHttpbinController-put - PUT /selftest/httpbin/put

- ID: API-OpenSelftestHttpbinController-put
- 类型: REST
- 方向: inbound
- 协议标识: PUT /selftest/httpbin/put
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.put`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@PutMapping("/selftest/httpbin/put")`

## API-OpenSelftestHttpbinController-delete - DELETE /selftest/httpbin/delete

- ID: API-OpenSelftestHttpbinController-delete
- 类型: REST
- 方向: inbound
- 协议标识: DELETE /selftest/httpbin/delete
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.delete`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@DeleteMapping("/selftest/httpbin/delete")`

## API-OpenSelftestHttpbinController-headers - GET /selftest/httpbin/headers

- ID: API-OpenSelftestHttpbinController-headers
- 类型: REST
- 方向: inbound
- 协议标识: GET /selftest/httpbin/headers
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.headers`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@GetMapping("/selftest/httpbin/headers")`

## API-OpenSelftestHttpbinController-ip - GET /selftest/httpbin/ip

- ID: API-OpenSelftestHttpbinController-ip
- 类型: REST
- 方向: inbound
- 协议标识: GET /selftest/httpbin/ip
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.ip`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@GetMapping("/selftest/httpbin/ip")`

## API-OpenSelftestHttpbinController-userAgent - GET /selftest/httpbin/user-agent

- ID: API-OpenSelftestHttpbinController-userAgent
- 类型: REST
- 方向: inbound
- 协议标识: GET /selftest/httpbin/user-agent
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.userAgent`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@GetMapping("/selftest/httpbin/user-agent")`

## API-OpenSelftestHttpbinController-uuid - GET /selftest/httpbin/uuid

- ID: API-OpenSelftestHttpbinController-uuid
- 类型: REST
- 方向: inbound
- 协议标识: GET /selftest/httpbin/uuid
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.uuid`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@GetMapping("/selftest/httpbin/uuid")`

## API-OpenSelftestHttpbinController-timeout - GET /selftest/httpbin/timeout

- ID: API-OpenSelftestHttpbinController-timeout
- 类型: REST
- 方向: inbound
- 协议标识: GET /selftest/httpbin/timeout
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `OpenSelftestHttpbinController.timeout`
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: OpenSelftestHttpbinController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无（自检被调端）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` 的 `@@GetMapping("/selftest/httpbin/timeout")`

## API-SysCaptchaController-getKaptchaImage - GET /captcha/captchaImage

- ID: API-SysCaptchaController-getKaptchaImage
- 类型: REST
- 方向: inbound
- 协议标识: GET /captcha/captchaImage
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` 的 `SysCaptchaController.getKaptchaImage`
- 消费者功能: FUNC-sys-captcha
- Controller/Provider/Consumer/Client: SysCaptchaController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` 的 `@@GetMapping("/captchaImage")`

## API-SysCaptchaController-captchaCode - GET /captcha/captchaCode

- ID: API-SysCaptchaController-captchaCode
- 类型: REST
- 方向: inbound
- 协议标识: GET /captcha/captchaCode
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` 的 `SysCaptchaController.captchaCode`
- 消费者功能: FUNC-sys-captcha
- Controller/Provider/Consumer/Client: SysCaptchaController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: 无
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` 的 `@@GetMapping("/captchaCode")`

## API-SysConfigController-list - POST /system/config/list

- ID: API-SysConfigController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/config/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.list`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@PostMapping("/list")`

## API-SysConfigController-export - POST /system/config/export

- ID: API-SysConfigController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/config/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.export`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@PostMapping("/export")`

## API-SysConfigController-add - GET /system/config/add

- ID: API-SysConfigController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/config/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.add`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 表单参数或同名实体（SysConfig）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@GetMapping("/add")`

## API-SysConfigController-addSave - POST /system/config/add

- ID: API-SysConfigController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/config/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.addSave`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 表单参数或同名实体（SysConfig）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@PostMapping("/add")`

## API-SysConfigController-edit - GET /system/config/edit/{configId}

- ID: API-SysConfigController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/config/edit/{configId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.edit`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 表单参数或同名实体（SysConfig）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@GetMapping("/edit/{configId}")`

## API-SysConfigController-editSave - POST /system/config/edit

- ID: API-SysConfigController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/config/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.editSave`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 表单参数或同名实体（SysConfig）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@PostMapping("/edit")`

## API-SysConfigController-remove - POST /system/config/remove

- ID: API-SysConfigController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/config/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.remove`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 表单参数或同名实体（SysConfig）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@PostMapping("/remove")`

## API-SysConfigController-refreshCache - GET /system/config/refreshCache

- ID: API-SysConfigController-refreshCache
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/config/refreshCache
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.refreshCache`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:remove`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@GetMapping("/refreshCache")`

## API-SysConfigController-checkConfigKeyUnique - POST /system/config/checkConfigKeyUnique

- ID: API-SysConfigController-checkConfigKeyUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/config/checkConfigKeyUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `SysConfigController.checkConfigKeyUnique`
- 消费者功能: FUNC-sys-config-manage
- Controller/Provider/Consumer/Client: SysConfigController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:config:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_config（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` 的 `@@PostMapping("/checkConfigKeyUnique")`

## API-SysDeptController-list - POST /system/dept/list

- ID: API-SysDeptController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dept/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.list`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@PostMapping("/list")`

## API-SysDeptController-add - GET /system/dept/add/{parentId}

- ID: API-SysDeptController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dept/add/{parentId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.add`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 表单参数或同名实体（SysDept）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@GetMapping("/add/{parentId}")`

## API-SysDeptController-addSave - POST /system/dept/add

- ID: API-SysDeptController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dept/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.addSave`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 表单参数或同名实体（SysDept）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@PostMapping("/add")`

## API-SysDeptController-edit - GET /system/dept/edit/{deptId}

- ID: API-SysDeptController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dept/edit/{deptId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.edit`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 表单参数或同名实体（SysDept）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@GetMapping("/edit/{deptId}")`

## API-SysDeptController-editSave - POST /system/dept/edit

- ID: API-SysDeptController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dept/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.editSave`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 表单参数或同名实体（SysDept）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@PostMapping("/edit")`

## API-SysDeptController-remove - GET /system/dept/remove/{deptId}

- ID: API-SysDeptController-remove
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dept/remove/{deptId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.remove`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 表单参数或同名实体（SysDept）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:remove`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@GetMapping("/remove/{deptId}")`

## API-SysDeptController-checkDeptNameUnique - POST /system/dept/checkDeptNameUnique

- ID: API-SysDeptController-checkDeptNameUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dept/checkDeptNameUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.checkDeptNameUnique`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@PostMapping("/checkDeptNameUnique")`

## API-SysDeptController-selectDeptTree - GET /system/dept/selectDeptTree/{deptId}

- ID: API-SysDeptController-selectDeptTree
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dept/selectDeptTree/{deptId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.selectDeptTree`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@GetMapping("/selectDeptTree/{deptId}")`

## API-SysDeptController-selectDeptTree-2 - GET /system/dept/selectDeptTree/{deptId}/{excludeId}

- ID: API-SysDeptController-selectDeptTree-2
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dept/selectDeptTree/{deptId}/{excludeId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.selectDeptTree`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@GetMapping("/selectDeptTree/{deptId}/{excludeId}")`

## API-SysDeptController-treeDataExcludeChild - GET /system/dept/treeData/{excludeId}

- ID: API-SysDeptController-treeDataExcludeChild
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dept/treeData/{excludeId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `SysDeptController.treeDataExcludeChild`
- 消费者功能: FUNC-sys-dept-manage
- Controller/Provider/Consumer/Client: SysDeptController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dept:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dept（R/C/U/D）、sys_user（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` 的 `@@GetMapping("/treeData/{excludeId}")`

## API-SysDictDataController-list - POST /system/dict/data/list

- ID: API-SysDictDataController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/data/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `SysDictDataController.list`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictDataController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:view`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_data（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `@@PostMapping("/list")`

## API-SysDictDataController-export - POST /system/dict/data/export

- ID: API-SysDictDataController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/data/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `SysDictDataController.export`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictDataController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_data（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `@@PostMapping("/export")`

## API-SysDictDataController-add - GET /system/dict/data/add/{dictType}

- ID: API-SysDictDataController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/data/add/{dictType}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `SysDictDataController.add`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictDataController
- 请求对象: 表单参数或同名实体（SysDictData）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_data（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `@@GetMapping("/add/{dictType}")`

## API-SysDictDataController-addSave - POST /system/dict/data/add

- ID: API-SysDictDataController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/data/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `SysDictDataController.addSave`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictDataController
- 请求对象: 表单参数或同名实体（SysDictData）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_data（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `@@PostMapping("/add")`

## API-SysDictDataController-edit - GET /system/dict/data/edit/{dictCode}

- ID: API-SysDictDataController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/data/edit/{dictCode}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `SysDictDataController.edit`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictDataController
- 请求对象: 表单参数或同名实体（SysDictData）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_data（R/C/U/D）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `@@GetMapping("/edit/{dictCode}")`

## API-SysDictDataController-editSave - POST /system/dict/data/edit

- ID: API-SysDictDataController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/data/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `SysDictDataController.editSave`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictDataController
- 请求对象: 表单参数或同名实体（SysDictData）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_data（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `@@PostMapping("/edit")`

## API-SysDictDataController-remove - POST /system/dict/data/remove

- ID: API-SysDictDataController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/data/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `SysDictDataController.remove`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictDataController
- 请求对象: 表单参数或同名实体（SysDictData）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_data（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` 的 `@@PostMapping("/remove")`

## API-SysDictTypeController-list - POST /system/dict/list

- ID: API-SysDictTypeController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.list`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:view`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@PostMapping("/list")`

## API-SysDictTypeController-export - POST /system/dict/export

- ID: API-SysDictTypeController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.export`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@PostMapping("/export")`

## API-SysDictTypeController-add - GET /system/dict/add

- ID: API-SysDictTypeController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.add`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 表单参数或同名实体（SysDictType）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@GetMapping("/add")`

## API-SysDictTypeController-addSave - POST /system/dict/add

- ID: API-SysDictTypeController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.addSave`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 表单参数或同名实体（SysDictType）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@PostMapping("/add")`

## API-SysDictTypeController-edit - GET /system/dict/edit/{dictId}

- ID: API-SysDictTypeController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/edit/{dictId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.edit`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 表单参数或同名实体（SysDictType）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@GetMapping("/edit/{dictId}")`

## API-SysDictTypeController-editSave - POST /system/dict/edit

- ID: API-SysDictTypeController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.editSave`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 表单参数或同名实体（SysDictType）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@PostMapping("/edit")`

## API-SysDictTypeController-remove - POST /system/dict/remove

- ID: API-SysDictTypeController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.remove`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 表单参数或同名实体（SysDictType）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@PostMapping("/remove")`

## API-SysDictTypeController-refreshCache - GET /system/dict/refreshCache

- ID: API-SysDictTypeController-refreshCache
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/refreshCache
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.refreshCache`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:remove`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@GetMapping("/refreshCache")`

## API-SysDictTypeController-detail - GET /system/dict/detail/{dictId}

- ID: API-SysDictTypeController-detail
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/detail/{dictId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.detail`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@GetMapping("/detail/{dictId}")`

## API-SysDictTypeController-checkDictTypeUnique - POST /system/dict/checkDictTypeUnique

- ID: API-SysDictTypeController-checkDictTypeUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/dict/checkDictTypeUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.checkDictTypeUnique`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:dict:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@PostMapping("/checkDictTypeUnique")`

## API-SysDictTypeController-selectDictTree - GET /system/dict/selectDictTree/{columnId}/{dictType}

- ID: API-SysDictTypeController-selectDictTree
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/selectDictTree/{columnId}/{dictType}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.selectDictTree`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@GetMapping("/selectDictTree/{columnId}/{dictType}")`

## API-SysDictTypeController-treeData - GET /system/dict/treeData

- ID: API-SysDictTypeController-treeData
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/dict/treeData
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `SysDictTypeController.treeData`
- 消费者功能: FUNC-sys-dict-manage
- Controller/Provider/Consumer/Client: SysDictTypeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_dict_type（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` 的 `@@GetMapping("/treeData")`

## API-SysIndexController-index - GET /index

- ID: API-SysIndexController-index
- 类型: REST
- 方向: inbound
- 协议标识: GET /index
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `SysIndexController.index`
- 消费者功能: FUNC-sys-index, FUNC-sys-unauth
- Controller/Provider/Consumer/Client: SysIndexController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `@@GetMapping("/index")`

## API-SysIndexController-lockscreen - GET /lockscreen

- ID: API-SysIndexController-lockscreen
- 类型: REST
- 方向: inbound
- 协议标识: GET /lockscreen
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `SysIndexController.lockscreen`
- 消费者功能: FUNC-sys-index, FUNC-sys-unauth
- Controller/Provider/Consumer/Client: SysIndexController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `@@GetMapping("/lockscreen")`

## API-SysIndexController-unlockscreen - POST /unlockscreen

- ID: API-SysIndexController-unlockscreen
- 类型: REST
- 方向: inbound
- 协议标识: POST /unlockscreen
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `SysIndexController.unlockscreen`
- 消费者功能: FUNC-sys-index, FUNC-sys-unauth
- Controller/Provider/Consumer/Client: SysIndexController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `@@PostMapping("/unlockscreen")`

## API-SysIndexController-switchSkin - GET /system/switchSkin

- ID: API-SysIndexController-switchSkin
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/switchSkin
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `SysIndexController.switchSkin`
- 消费者功能: FUNC-sys-index, FUNC-sys-unauth
- Controller/Provider/Consumer/Client: SysIndexController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `@@GetMapping("/system/switchSkin")`

## API-SysIndexController-menuStyle - GET /system/menuStyle/{style}

- ID: API-SysIndexController-menuStyle
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menuStyle/{style}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `SysIndexController.menuStyle`
- 消费者功能: FUNC-sys-index, FUNC-sys-unauth
- Controller/Provider/Consumer/Client: SysIndexController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `@@GetMapping("/system/menuStyle/{style}")`

## API-SysIndexController-main - GET /system/main

- ID: API-SysIndexController-main
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/main
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `SysIndexController.main`
- 消费者功能: FUNC-sys-index, FUNC-sys-unauth
- Controller/Provider/Consumer/Client: SysIndexController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` 的 `@@GetMapping("/system/main")`

## API-SysJobController-list - POST /monitor/job/list

- ID: API-SysJobController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.list`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/list")`

## API-SysJobController-export - POST /monitor/job/export

- ID: API-SysJobController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.export`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/export")`

## API-SysJobController-remove - POST /monitor/job/remove

- ID: API-SysJobController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.remove`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 表单参数或同名实体（SysJob）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/remove")`

## API-SysJobController-detail - GET /monitor/job/detail/{jobId}

- ID: API-SysJobController-detail
- 类型: REST
- 方向: inbound
- 协议标识: GET /monitor/job/detail/{jobId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.detail`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:detail`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@GetMapping("/detail/{jobId}")`

## API-SysJobController-changeStatus - POST /monitor/job/changeStatus

- ID: API-SysJobController-changeStatus
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/changeStatus
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.changeStatus`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 表单参数或同名实体（SysJob）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:changeStatus`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/changeStatus")`

## API-SysJobController-run - POST /monitor/job/run

- ID: API-SysJobController-run
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/run
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.run`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:changeStatus`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/run")`

## API-SysJobController-add - GET /monitor/job/add

- ID: API-SysJobController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /monitor/job/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.add`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 表单参数或同名实体（SysJob）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@GetMapping("/add")`

## API-SysJobController-addSave - POST /monitor/job/add

- ID: API-SysJobController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.addSave`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 表单参数或同名实体（SysJob）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/add")`

## API-SysJobController-edit - GET /monitor/job/edit/{jobId}

- ID: API-SysJobController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /monitor/job/edit/{jobId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.edit`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 表单参数或同名实体（SysJob）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@GetMapping("/edit/{jobId}")`

## API-SysJobController-editSave - POST /monitor/job/edit

- ID: API-SysJobController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.editSave`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 表单参数或同名实体（SysJob）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/edit")`

## API-SysJobController-checkCronExpressionIsValid - POST /monitor/job/checkCronExpressionIsValid

- ID: API-SysJobController-checkCronExpressionIsValid
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/job/checkCronExpressionIsValid
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.checkCronExpressionIsValid`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@PostMapping("/checkCronExpressionIsValid")`

## API-SysJobController-cron - GET /monitor/job/cron

- ID: API-SysJobController-cron
- 类型: REST
- 方向: inbound
- 协议标识: GET /monitor/job/cron
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.cron`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@GetMapping("/cron")`

## API-SysJobController-queryCronExpression - GET /monitor/job/queryCronExpression

- ID: API-SysJobController-queryCronExpression
- 类型: REST
- 方向: inbound
- 协议标识: GET /monitor/job/queryCronExpression
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `SysJobController.queryCronExpression`
- 消费者功能: FUNC-job-manage
- Controller/Provider/Consumer/Client: SysJobController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` 的 `@@GetMapping("/queryCronExpression")`

## API-SysJobLogController-list - POST /monitor/jobLog/list

- ID: API-SysJobLogController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/jobLog/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `SysJobLogController.list`
- 消费者功能: FUNC-job-log-query
- Controller/Provider/Consumer/Client: SysJobLogController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job_log（R/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `@@PostMapping("/list")`

## API-SysJobLogController-export - POST /monitor/jobLog/export

- ID: API-SysJobLogController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/jobLog/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `SysJobLogController.export`
- 消费者功能: FUNC-job-log-query
- Controller/Provider/Consumer/Client: SysJobLogController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job_log（R/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `@@PostMapping("/export")`

## API-SysJobLogController-remove - POST /monitor/jobLog/remove

- ID: API-SysJobLogController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/jobLog/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `SysJobLogController.remove`
- 消费者功能: FUNC-job-log-query
- Controller/Provider/Consumer/Client: SysJobLogController
- 请求对象: 表单参数或同名实体（SysJobLog）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job_log（R/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `@@PostMapping("/remove")`

## API-SysJobLogController-detail - GET /monitor/jobLog/detail/{jobLogId}

- ID: API-SysJobLogController-detail
- 类型: REST
- 方向: inbound
- 协议标识: GET /monitor/jobLog/detail/{jobLogId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `SysJobLogController.detail`
- 消费者功能: FUNC-job-log-query
- Controller/Provider/Consumer/Client: SysJobLogController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:detail`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job_log（R/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `@@GetMapping("/detail/{jobLogId}")`

## API-SysJobLogController-clean - POST /monitor/jobLog/clean

- ID: API-SysJobLogController-clean
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/jobLog/clean
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `SysJobLogController.clean`
- 消费者功能: FUNC-job-log-query
- Controller/Provider/Consumer/Client: SysJobLogController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `monitor:job:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_job_log（R/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` 的 `@@PostMapping("/clean")`

## API-SysLoginController-login - GET /login

- ID: API-SysLoginController-login
- 类型: REST
- 方向: inbound
- 协议标识: GET /login
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` 的 `SysLoginController.login`
- 消费者功能: FUNC-sys-login, FUNC-sys-logout
- Controller/Provider/Consumer/Client: SysLoginController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）、sys_logininfor（C）、sys_user_online（C）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` 的 `@@GetMapping("/login")`

## API-SysLoginController-ajaxLogin - POST /login

- ID: API-SysLoginController-ajaxLogin
- 类型: REST
- 方向: inbound
- 协议标识: POST /login
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` 的 `SysLoginController.ajaxLogin`
- 消费者功能: FUNC-sys-login, FUNC-sys-logout
- Controller/Provider/Consumer/Client: SysLoginController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）、sys_logininfor（C）、sys_user_online（C）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` 的 `@@PostMapping("/login")`

## API-SysLoginController-unauth - GET /unauth

- ID: API-SysLoginController-unauth
- 类型: REST
- 方向: inbound
- 协议标识: GET /unauth
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` 的 `SysLoginController.unauth`
- 消费者功能: FUNC-sys-login, FUNC-sys-logout
- Controller/Provider/Consumer/Client: SysLoginController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）、sys_logininfor（C）、sys_user_online（C）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` 的 `@@GetMapping("/unauth")`

## API-SysMenuController-list - POST /system/menu/list

- ID: API-SysMenuController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/menu/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.list`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:menu:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@PostMapping("/list")`

## API-SysMenuController-remove - GET /system/menu/remove/{menuId}

- ID: API-SysMenuController-remove
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menu/remove/{menuId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.remove`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 表单参数或同名实体（SysMenu）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:menu:remove`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@GetMapping("/remove/{menuId}")`

## API-SysMenuController-add - GET /system/menu/add/{parentId}

- ID: API-SysMenuController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menu/add/{parentId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.add`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 表单参数或同名实体（SysMenu）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:menu:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@GetMapping("/add/{parentId}")`

## API-SysMenuController-addSave - POST /system/menu/add

- ID: API-SysMenuController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/menu/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.addSave`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 表单参数或同名实体（SysMenu）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:menu:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@PostMapping("/add")`

## API-SysMenuController-edit - GET /system/menu/edit/{menuId}

- ID: API-SysMenuController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menu/edit/{menuId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.edit`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 表单参数或同名实体（SysMenu）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:menu:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@GetMapping("/edit/{menuId}")`

## API-SysMenuController-editSave - POST /system/menu/edit

- ID: API-SysMenuController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/menu/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.editSave`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 表单参数或同名实体（SysMenu）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:menu:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@PostMapping("/edit")`

## API-SysMenuController-updateSort - POST /system/menu/updateSort

- ID: API-SysMenuController-updateSort
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/menu/updateSort
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.updateSort`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 表单参数或同名实体（SysMenu）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@PostMapping("/updateSort")`

## API-SysMenuController-icon - GET /system/menu/icon

- ID: API-SysMenuController-icon
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menu/icon
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.icon`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@GetMapping("/icon")`

## API-SysMenuController-checkMenuNameUnique - POST /system/menu/checkMenuNameUnique

- ID: API-SysMenuController-checkMenuNameUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/menu/checkMenuNameUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.checkMenuNameUnique`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@PostMapping("/checkMenuNameUnique")`

## API-SysMenuController-roleMenuTreeData - GET /system/menu/roleMenuTreeData

- ID: API-SysMenuController-roleMenuTreeData
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menu/roleMenuTreeData
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.roleMenuTreeData`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@GetMapping("/roleMenuTreeData")`

## API-SysMenuController-menuTreeData - GET /system/menu/menuTreeData

- ID: API-SysMenuController-menuTreeData
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menu/menuTreeData
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.menuTreeData`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@GetMapping("/menuTreeData")`

## API-SysMenuController-selectMenuTree - GET /system/menu/selectMenuTree/{menuId}

- ID: API-SysMenuController-selectMenuTree
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/menu/selectMenuTree/{menuId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `SysMenuController.selectMenuTree`
- 消费者功能: FUNC-sys-menu-manage
- Controller/Provider/Consumer/Client: SysMenuController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_menu（R/C/U/D）、sys_role_menu（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` 的 `@@GetMapping("/selectMenuTree/{menuId}")`

## API-SysNoticeController-list - POST /system/notice/list

- ID: API-SysNoticeController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/notice/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `SysNoticeController.list`
- 消费者功能: FUNC-sys-notice-manage
- Controller/Provider/Consumer/Client: SysNoticeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:notice:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_notice（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `@@PostMapping("/list")`

## API-SysNoticeController-add - GET /system/notice/add

- ID: API-SysNoticeController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/notice/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `SysNoticeController.add`
- 消费者功能: FUNC-sys-notice-manage
- Controller/Provider/Consumer/Client: SysNoticeController
- 请求对象: 表单参数或同名实体（SysNotice）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:notice:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_notice（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `@@GetMapping("/add")`

## API-SysNoticeController-addSave - POST /system/notice/add

- ID: API-SysNoticeController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/notice/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `SysNoticeController.addSave`
- 消费者功能: FUNC-sys-notice-manage
- Controller/Provider/Consumer/Client: SysNoticeController
- 请求对象: 表单参数或同名实体（SysNotice）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:notice:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_notice（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `@@PostMapping("/add")`

## API-SysNoticeController-edit - GET /system/notice/edit/{noticeId}

- ID: API-SysNoticeController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/notice/edit/{noticeId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `SysNoticeController.edit`
- 消费者功能: FUNC-sys-notice-manage
- Controller/Provider/Consumer/Client: SysNoticeController
- 请求对象: 表单参数或同名实体（SysNotice）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:notice:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_notice（R/C/U/D）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `@@GetMapping("/edit/{noticeId}")`

## API-SysNoticeController-editSave - POST /system/notice/edit

- ID: API-SysNoticeController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/notice/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `SysNoticeController.editSave`
- 消费者功能: FUNC-sys-notice-manage
- Controller/Provider/Consumer/Client: SysNoticeController
- 请求对象: 表单参数或同名实体（SysNotice）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:notice:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_notice（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `@@PostMapping("/edit")`

## API-SysNoticeController-view - GET /system/notice/view/{noticeId}

- ID: API-SysNoticeController-view
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/notice/view/{noticeId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `SysNoticeController.view`
- 消费者功能: FUNC-sys-notice-manage
- Controller/Provider/Consumer/Client: SysNoticeController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:notice:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_notice（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `@@GetMapping("/view/{noticeId}")`

## API-SysNoticeController-remove - POST /system/notice/remove

- ID: API-SysNoticeController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/notice/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `SysNoticeController.remove`
- 消费者功能: FUNC-sys-notice-manage
- Controller/Provider/Consumer/Client: SysNoticeController
- 请求对象: 表单参数或同名实体（SysNotice）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:notice:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_notice（R/C/U/D）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` 的 `@@PostMapping("/remove")`

## API-SysPostController-list - POST /system/post/list

- ID: API-SysPostController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/post/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.list`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:post:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@PostMapping("/list")`

## API-SysPostController-export - POST /system/post/export

- ID: API-SysPostController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/post/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.export`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:post:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@PostMapping("/export")`

## API-SysPostController-remove - POST /system/post/remove

- ID: API-SysPostController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/post/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.remove`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 表单参数或同名实体（SysPost）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:post:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@PostMapping("/remove")`

## API-SysPostController-add - GET /system/post/add

- ID: API-SysPostController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/post/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.add`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 表单参数或同名实体（SysPost）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:post:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@GetMapping("/add")`

## API-SysPostController-addSave - POST /system/post/add

- ID: API-SysPostController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/post/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.addSave`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 表单参数或同名实体（SysPost）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:post:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@PostMapping("/add")`

## API-SysPostController-edit - GET /system/post/edit/{postId}

- ID: API-SysPostController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/post/edit/{postId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.edit`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 表单参数或同名实体（SysPost）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:post:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@GetMapping("/edit/{postId}")`

## API-SysPostController-editSave - POST /system/post/edit

- ID: API-SysPostController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/post/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.editSave`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 表单参数或同名实体（SysPost）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:post:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@PostMapping("/edit")`

## API-SysPostController-checkPostNameUnique - POST /system/post/checkPostNameUnique

- ID: API-SysPostController-checkPostNameUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/post/checkPostNameUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.checkPostNameUnique`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@PostMapping("/checkPostNameUnique")`

## API-SysPostController-checkPostCodeUnique - POST /system/post/checkPostCodeUnique

- ID: API-SysPostController-checkPostCodeUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/post/checkPostCodeUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `SysPostController.checkPostCodeUnique`
- 消费者功能: FUNC-sys-post-manage
- Controller/Provider/Consumer/Client: SysPostController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_post（R/C/U/D）、sys_user_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` 的 `@@PostMapping("/checkPostCodeUnique")`

## API-SysProfileController-checkPassword - GET /system/user/profile/checkPassword

- ID: API-SysProfileController-checkPassword
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/profile/checkPassword
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `SysProfileController.checkPassword`
- 消费者功能: FUNC-sys-profile, FUNC-sys-profile-avatar
- Controller/Provider/Consumer/Client: SysProfileController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `@@GetMapping("/checkPassword")`

## API-SysProfileController-resetPwd - GET /system/user/profile/resetPwd

- ID: API-SysProfileController-resetPwd
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/profile/resetPwd
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `SysProfileController.resetPwd`
- 消费者功能: FUNC-sys-profile, FUNC-sys-profile-avatar
- Controller/Provider/Consumer/Client: SysProfileController
- 请求对象: 表单参数或同名实体（SysProfile）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `@@GetMapping("/resetPwd")`

## API-SysProfileController-resetPwd-2 - POST /system/user/profile/resetPwd

- ID: API-SysProfileController-resetPwd-2
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/profile/resetPwd
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `SysProfileController.resetPwd`
- 消费者功能: FUNC-sys-profile, FUNC-sys-profile-avatar
- Controller/Provider/Consumer/Client: SysProfileController
- 请求对象: 表单参数或同名实体（SysProfile）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `@@PostMapping("/resetPwd")`

## API-SysProfileController-edit - GET /system/user/profile/edit

- ID: API-SysProfileController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/profile/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `SysProfileController.edit`
- 消费者功能: FUNC-sys-profile, FUNC-sys-profile-avatar
- Controller/Provider/Consumer/Client: SysProfileController
- 请求对象: 表单参数或同名实体（SysProfile）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `@@GetMapping("/edit")`

## API-SysProfileController-avatar - GET /system/user/profile/avatar

- ID: API-SysProfileController-avatar
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/profile/avatar
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `SysProfileController.avatar`
- 消费者功能: FUNC-sys-profile, FUNC-sys-profile-avatar
- Controller/Provider/Consumer/Client: SysProfileController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `@@GetMapping("/avatar")`

## API-SysProfileController-update - POST /system/user/profile/update

- ID: API-SysProfileController-update
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/profile/update
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `SysProfileController.update`
- 消费者功能: FUNC-sys-profile, FUNC-sys-profile-avatar
- Controller/Provider/Consumer/Client: SysProfileController
- 请求对象: 表单参数或同名实体（SysProfile）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `@@PostMapping("/update")`

## API-SysProfileController-updateAvatar - POST /system/user/profile/updateAvatar

- ID: API-SysProfileController-updateAvatar
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/profile/updateAvatar
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `SysProfileController.updateAvatar`
- 消费者功能: FUNC-sys-profile, FUNC-sys-profile-avatar
- Controller/Provider/Consumer/Client: SysProfileController
- 请求对象: 表单参数或同名实体（SysProfile）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/U）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` 的 `@@PostMapping("/updateAvatar")`

## API-SysRegisterController-register - GET /register

- ID: API-SysRegisterController-register
- 类型: REST
- 方向: inbound
- 协议标识: GET /register
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java` 的 `SysRegisterController.register`
- 消费者功能: FUNC-sys-register
- Controller/Provider/Consumer/Client: SysRegisterController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（C）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java` 的 `@@GetMapping("/register")`

## API-SysRegisterController-ajaxRegister - POST /register

- ID: API-SysRegisterController-ajaxRegister
- 类型: REST
- 方向: inbound
- 协议标识: POST /register
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java` 的 `SysRegisterController.ajaxRegister`
- 消费者功能: FUNC-sys-register
- Controller/Provider/Consumer/Client: SysRegisterController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（C）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java` 的 `@@PostMapping("/register")`

## API-SysRoleController-list - POST /system/role/list

- ID: API-SysRoleController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.list`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/list")`

## API-SysRoleController-export - POST /system/role/export

- ID: API-SysRoleController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.export`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/export")`

## API-SysRoleController-add - GET /system/role/add

- ID: API-SysRoleController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/role/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.add`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 表单参数或同名实体（SysRole）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@GetMapping("/add")`

## API-SysRoleController-addSave - POST /system/role/add

- ID: API-SysRoleController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.addSave`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 表单参数或同名实体（SysRole）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/add")`

## API-SysRoleController-edit - GET /system/role/edit/{roleId}

- ID: API-SysRoleController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/role/edit/{roleId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.edit`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 表单参数或同名实体（SysRole）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@GetMapping("/edit/{roleId}")`

## API-SysRoleController-editSave - POST /system/role/edit

- ID: API-SysRoleController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.editSave`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 表单参数或同名实体（SysRole）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/edit")`

## API-SysRoleController-authDataScope - GET /system/role/authDataScope/{roleId}

- ID: API-SysRoleController-authDataScope
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/role/authDataScope/{roleId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.authDataScope`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@GetMapping("/authDataScope/{roleId}")`

## API-SysRoleController-authDataScopeSave - POST /system/role/authDataScope

- ID: API-SysRoleController-authDataScopeSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/authDataScope
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.authDataScopeSave`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/authDataScope")`

## API-SysRoleController-remove - POST /system/role/remove

- ID: API-SysRoleController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.remove`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 表单参数或同名实体（SysRole）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/remove")`

## API-SysRoleController-checkRoleNameUnique - POST /system/role/checkRoleNameUnique

- ID: API-SysRoleController-checkRoleNameUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/checkRoleNameUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.checkRoleNameUnique`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/checkRoleNameUnique")`

## API-SysRoleController-checkRoleKeyUnique - POST /system/role/checkRoleKeyUnique

- ID: API-SysRoleController-checkRoleKeyUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/checkRoleKeyUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.checkRoleKeyUnique`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/checkRoleKeyUnique")`

## API-SysRoleController-selectMenuTree - GET /system/role/selectMenuTree

- ID: API-SysRoleController-selectMenuTree
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/role/selectMenuTree
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.selectMenuTree`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@GetMapping("/selectMenuTree")`

## API-SysRoleController-changeStatus - POST /system/role/changeStatus

- ID: API-SysRoleController-changeStatus
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/changeStatus
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.changeStatus`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 表单参数或同名实体（SysRole）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/changeStatus")`

## API-SysRoleController-authUser - GET /system/role/authUser/{roleId}

- ID: API-SysRoleController-authUser
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/role/authUser/{roleId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.authUser`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@GetMapping("/authUser/{roleId}")`

## API-SysRoleController-allocatedList - POST /system/role/authUser/allocatedList

- ID: API-SysRoleController-allocatedList
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/authUser/allocatedList
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.allocatedList`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/authUser/allocatedList")`

## API-SysRoleController-cancelAuthUser - POST /system/role/authUser/cancel

- ID: API-SysRoleController-cancelAuthUser
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/authUser/cancel
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.cancelAuthUser`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/authUser/cancel")`

## API-SysRoleController-cancelAuthUserAll - POST /system/role/authUser/cancelAll

- ID: API-SysRoleController-cancelAuthUserAll
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/authUser/cancelAll
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.cancelAuthUserAll`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/authUser/cancelAll")`

## API-SysRoleController-selectUser - GET /system/role/authUser/selectUser/{roleId}

- ID: API-SysRoleController-selectUser
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/role/authUser/selectUser/{roleId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.selectUser`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@GetMapping("/authUser/selectUser/{roleId}")`

## API-SysRoleController-unallocatedList - POST /system/role/authUser/unallocatedList

- ID: API-SysRoleController-unallocatedList
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/authUser/unallocatedList
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.unallocatedList`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/authUser/unallocatedList")`

## API-SysRoleController-selectAuthUserAll - POST /system/role/authUser/selectAll

- ID: API-SysRoleController-selectAuthUserAll
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/role/authUser/selectAll
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.selectAuthUserAll`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@PostMapping("/authUser/selectAll")`

## API-SysRoleController-deptTreeData - GET /system/role/deptTreeData

- ID: API-SysRoleController-deptTreeData
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/role/deptTreeData
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `SysRoleController.deptTreeData`
- 消费者功能: FUNC-sys-role-manage
- Controller/Provider/Consumer/Client: SysRoleController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:role:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` 的 `@@GetMapping("/deptTreeData")`

## API-SysUserController-list - POST /system/user/list

- ID: API-SysUserController-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/list
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.list`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: TableDataInfo（分页表格）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:list`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/list")`

## API-SysUserController-export - POST /system/user/export

- ID: API-SysUserController-export
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/export
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.export`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:export`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/export")`

## API-SysUserController-importData - POST /system/user/importData

- ID: API-SysUserController-importData
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/importData
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.importData`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:import`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/importData")`

## API-SysUserController-importTemplate - GET /system/user/importTemplate

- ID: API-SysUserController-importTemplate
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/importTemplate
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.importTemplate`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:view`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/importTemplate")`

## API-SysUserController-add - GET /system/user/add

- ID: API-SysUserController-add
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.add`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:add`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/add")`

## API-SysUserController-addSave - POST /system/user/add

- ID: API-SysUserController-addSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/add
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.addSave`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:add`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/add")`

## API-SysUserController-edit - GET /system/user/edit/{userId}

- ID: API-SysUserController-edit
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/edit/{userId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.edit`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/edit/{userId}")`

## API-SysUserController-view - GET /system/user/view/{userId}

- ID: API-SysUserController-view
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/view/{userId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.view`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/view/{userId}")`

## API-SysUserController-editSave - POST /system/user/edit

- ID: API-SysUserController-editSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/edit
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.editSave`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/edit")`

## API-SysUserController-resetPwd - GET /system/user/resetPwd/{userId}

- ID: API-SysUserController-resetPwd
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/resetPwd/{userId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.resetPwd`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:resetPwd`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/resetPwd/{userId}")`

## API-SysUserController-resetPwdSave - POST /system/user/resetPwd

- ID: API-SysUserController-resetPwdSave
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/resetPwd
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.resetPwdSave`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:resetPwd`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/resetPwd")`

## API-SysUserController-authRole - GET /system/user/authRole/{userId}

- ID: API-SysUserController-authRole
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/authRole/{userId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.authRole`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:edit`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/authRole/{userId}")`

## API-SysUserController-insertAuthRole - POST /system/user/authRole/insertAuthRole

- ID: API-SysUserController-insertAuthRole
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/authRole/insertAuthRole
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.insertAuthRole`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/authRole/insertAuthRole")`

## API-SysUserController-remove - POST /system/user/remove

- ID: API-SysUserController-remove
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/remove
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.remove`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:remove`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/remove")`

## API-SysUserController-checkLoginNameUnique - POST /system/user/checkLoginNameUnique

- ID: API-SysUserController-checkLoginNameUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/checkLoginNameUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.checkLoginNameUnique`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/checkLoginNameUnique")`

## API-SysUserController-checkPhoneUnique - POST /system/user/checkPhoneUnique

- ID: API-SysUserController-checkPhoneUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/checkPhoneUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.checkPhoneUnique`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/checkPhoneUnique")`

## API-SysUserController-checkEmailUnique - POST /system/user/checkEmailUnique

- ID: API-SysUserController-checkEmailUnique
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/checkEmailUnique
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.checkEmailUnique`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: 仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/checkEmailUnique")`

## API-SysUserController-changeStatus - POST /system/user/changeStatus

- ID: API-SysUserController-changeStatus
- 类型: REST
- 方向: inbound
- 协议标识: POST /system/user/changeStatus
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.changeStatus`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 表单参数或同名实体（SysUser）
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:edit`
- 幂等与重放: 写操作按业务主键判重，未实现显式幂等令牌
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@PostMapping("/changeStatus")`

## API-SysUserController-deptTreeData - GET /system/user/deptTreeData

- ID: API-SysUserController-deptTreeData
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/deptTreeData
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.deptTreeData`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/deptTreeData")`

## API-SysUserController-selectDeptTree - GET /system/user/selectDeptTree/{deptId}

- ID: API-SysUserController-selectDeptTree
- 类型: REST
- 方向: inbound
- 协议标识: GET /system/user/selectDeptTree/{deptId}
- 提供者: `com.qvsu` 下 `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `SysUserController.selectDeptTree`
- 消费者功能: FUNC-sys-user-manage
- Controller/Provider/Consumer/Client: SysUserController
- 请求对象: 查询参数 / 分页参数
- 响应对象: AjaxResult（统一操作结果）
- 认证与权限: Shiro 会话认证 + 权限码 `system:user:list`
- 幂等与重放: 查询/渲染，天然幂等
- 调用下游: 同模块 Service → Mapper → 物理表；详见 [`function-chain-index.md`](./function-chain-index.md)
- 物理表操作: sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）
- 兼容性风险: 路径或参数变更会同步影响前端模板中的硬编码 URL
- 证据: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` 的 `@@GetMapping("/selectDeptTree/{deptId}")`

## 2. 非端点型接口主定义

## API-open-gateway - REST 接口

- ID: API-open-gateway
- 类型: REST
- 方向: inbound
- 协议标识: ALL /open/**（具体前缀由 OpenGatewayController 与其过滤器决定）
- 提供者: com.qvsu.open.controller.OpenGatewayController + com.qvsu.open.filter
- 消费者功能: FUNC-open-gateway-invoke
- Controller/Provider/Consumer/Client: com.qvsu.open.controller.OpenGatewayController + com.qvsu.open.filter
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: AjaxResult 或业务响应体
- 认证与权限: 开放平台独立鉴权链路（应用凭据 + 接口授权校验），不走 Shiro 会话
- 幂等与重放: 依赖业务主键
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-open-gateway-invoke
- 物理表操作: open_app（R）、open_api（R）、open_app_api（R）、open_call_log（C）
- 兼容性风险: 对外契约，字段或鉴权方式变更将破坏所有已接入的第三方应用
- 证据: `com.qvsu.open.controller.OpenGatewayController` 与 `com.qvsu.open.filter` 源码

## API-global-exception - INTERNAL 接口

- ID: API-global-exception
- 类型: INTERNAL
- 方向: internal
- 协议标识: @ControllerAdvice 全局异常拦截
- 提供者: com.qvsu.framework.web.exception.GlobalExceptionHandler
- 消费者功能: FUNC-global-exception
- Controller/Provider/Consumer/Client: com.qvsu.framework.web.exception.GlobalExceptionHandler
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: AjaxResult 或业务响应体
- 认证与权限: 系统内部调用
- 幂等与重放: 依赖业务主键
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-global-exception
- 物理表操作: 无
- 兼容性风险: 内部契约，变更影响面可控
- 证据: 源码扫描

## API-common-upload - REST 接口

- ID: API-common-upload
- 类型: REST
- 方向: inbound
- 协议标识: POST /common/upload
- 提供者: com.qvsu.web.controller.common.CommonController
- 消费者功能: FUNC-common-upload
- Controller/Provider/Consumer/Client: com.qvsu.web.controller.common.CommonController
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: AjaxResult 或业务响应体
- 认证与权限: Shiro 会话认证 + 对应权限码
- 幂等与重放: 依赖业务主键
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-common-upload
- 物理表操作: 无（文件系统）
- 兼容性风险: 内部契约，变更影响面可控
- 证据: 源码扫描

## API-common-download - REST 接口

- ID: API-common-download
- 类型: REST
- 方向: inbound
- 协议标识: GET /common/download、GET /common/download/resource
- 提供者: com.qvsu.web.controller.common.CommonController
- 消费者功能: FUNC-common-download
- Controller/Provider/Consumer/Client: com.qvsu.web.controller.common.CommonController
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: AjaxResult 或业务响应体
- 认证与权限: Shiro 会话认证 + 对应权限码
- 幂等与重放: 依赖业务主键
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-common-download
- 物理表操作: 无（文件系统）
- 兼容性风险: 内部契约，变更影响面可控
- 证据: 源码扫描

## API-captcha-image - REST 接口

- ID: API-captcha-image
- 类型: REST
- 方向: inbound
- 协议标识: GET /captcha/captchaImage
- 提供者: com.qvsu.web.controller.system.SysCaptchaController
- 消费者功能: FUNC-sys-captcha
- Controller/Provider/Consumer/Client: com.qvsu.web.controller.system.SysCaptchaController
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: AjaxResult 或业务响应体
- 认证与权限: Shiro 会话认证 + 对应权限码
- 幂等与重放: 依赖业务主键
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-sys-captcha
- 物理表操作: 无（会话内存）
- 兼容性风险: 内部契约，变更影响面可控
- 证据: 源码扫描

## API-open-selftest-echo - REST 接口

- ID: API-open-selftest-echo
- 类型: REST
- 方向: internal
- 协议标识: GET/POST/PUT/DELETE /selftest/httpbin/**
- 提供者: com.qvsu.open.controller.OpenSelftestHttpbinController
- 消费者功能: FUNC-open-selftest
- Controller/Provider/Consumer/Client: com.qvsu.open.controller.OpenSelftestHttpbinController
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: AjaxResult 或业务响应体
- 认证与权限: Shiro 会话认证 + 对应权限码
- 幂等与重放: 依赖业务主键
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-open-selftest
- 物理表操作: 无
- 兼容性风险: 内部契约，变更影响面可控
- 证据: 源码扫描

## API-joblog-list - REST 接口

- ID: API-joblog-list
- 类型: REST
- 方向: inbound
- 协议标识: POST /monitor/jobLog/list（由 SysJobLogController 提供）
- 提供者: com.qvsu.quartz.controller.SysJobLogController
- 消费者功能: FUNC-job-log-query
- Controller/Provider/Consumer/Client: com.qvsu.quartz.controller.SysJobLogController
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: AjaxResult 或业务响应体
- 认证与权限: Shiro 会话认证 + 对应权限码
- 幂等与重放: 依赖业务主键
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-job-log-query
- 物理表操作: sys_job_log（R/D）
- 兼容性风险: 内部契约，变更影响面可控
- 证据: 源码扫描

## JOB-quartz-dispatch - BATCH 接口

- ID: JOB-quartz-dispatch
- 类型: BATCH
- 方向: internal
- 协议标识: Quartz 调度器按 Cron 触发，反射调用 sys_job.invoke_target
- 提供者: com.qvsu.quartz.config + com.qvsu.quartz.service.impl.SysJobServiceImpl
- 消费者功能: FUNC-job-scheduler
- Controller/Provider/Consumer/Client: com.qvsu.quartz.config + com.qvsu.quartz.service.impl.SysJobServiceImpl
- 请求对象: 见 [`domain-model.md`](./domain-model.md) 对应对象
- 响应对象: 无（调度器内部调用）
- 认证与权限: 系统内部调用
- 幂等与重放: 按 Cron 触发，异常不重试
- 调用下游: 见 [`function-chain-index.md`](./function-chain-index.md) 中 FUNC-job-scheduler
- 物理表操作: sys_job（R/U）、sys_job_log（C）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）、QRTZ_CRON_TRIGGERS（R）
- 兼容性风险: 内部契约，变更影响面可控
- 证据: `com.qvsu.quartz.config` 与 `SysJobServiceImpl` 源码

## 3. 端点权限覆盖缺口

在 184 个 HTTP 端点中，有 79 个未标注 `@RequiresPermissions`。逐个列出如下（这些端点仅受 Shiro 会话认证保护，属需要复核的权限缺口）：

| 接口 ID | 端点 | 提供者 | 风险判断 |
|---|---|---|---|
| API-CommonController-fileDownload | GET /common/download | CommonController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-CommonController-uploadFile | POST /common/upload | CommonController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-CommonController-uploadFiles | POST /common/uploads | CommonController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-CommonController-resourceDownload | GET /common/download/resource | CommonController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenApiMgrController-list | POST /admin/open/api/list | OpenApiMgrController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenApiMgrController-curl | GET /admin/open/api/curl/{id} | OpenApiMgrController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenApiMgrController-add | GET /admin/open/api/add | OpenApiMgrController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenApiMgrController-addSave | POST /admin/open/api/add | OpenApiMgrController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenApiMgrController-edit | GET /admin/open/api/edit/{id} | OpenApiMgrController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenApiMgrController-editSave | POST /admin/open/api/edit | OpenApiMgrController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenApiMgrController-remove | POST /admin/open/api/remove | OpenApiMgrController | **高危**：写操作缺少权限码校验 |
| API-OpenAppController-list | POST /admin/open/app/list | OpenAppController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAppController-add | GET /admin/open/app/add | OpenAppController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAppController-addSave | POST /admin/open/app/add | OpenAppController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAppController-edit | GET /admin/open/app/edit/{id} | OpenAppController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAppController-editSave | POST /admin/open/app/edit | OpenAppController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAppController-remove | POST /admin/open/app/remove | OpenAppController | **高危**：写操作缺少权限码校验 |
| API-OpenAppController-resetSecret | POST /admin/open/app/resetSecret | OpenAppController | **高危**：写操作缺少权限码校验 |
| API-OpenAuthController-apps | GET /admin/open/auth/apps | OpenAuthController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAuthController-apis | GET /admin/open/auth/apis | OpenAuthController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAuthController-apiIds | GET /admin/open/auth/apiIds | OpenAuthController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenAuthController-save | POST /admin/open/auth/save | OpenAuthController | **高危**：写操作缺少权限码校验 |
| API-OpenDocController-apis | GET /admin/open/doc/apis | OpenDocController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenDocController-html | GET /admin/open/doc/html/{apiId} | OpenDocController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenDocController-list | GET /admin/open/doc/list | OpenDocController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenDocController-generate | POST /admin/open/doc/generate | OpenDocController | **高危**：写操作缺少权限码校验 |
| API-OpenDocController-download | GET /admin/open/doc/download | OpenDocController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenLogController-list | POST /admin/open/log/list | OpenLogController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenLogController-stats | GET /admin/open/log/stats | OpenLogController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenLogController-exportCsv | GET /admin/open/log/exportCsv | OpenLogController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-get | GET /selftest/httpbin/get | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-post | POST /selftest/httpbin/post | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-put | PUT /selftest/httpbin/put | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-delete | DELETE /selftest/httpbin/delete | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-headers | GET /selftest/httpbin/headers | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-ip | GET /selftest/httpbin/ip | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-userAgent | GET /selftest/httpbin/user-agent | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-uuid | GET /selftest/httpbin/uuid | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-OpenSelftestHttpbinController-timeout | GET /selftest/httpbin/timeout | OpenSelftestHttpbinController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysCaptchaController-getKaptchaImage | GET /captcha/captchaImage | SysCaptchaController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysCaptchaController-captchaCode | GET /captcha/captchaCode | SysCaptchaController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysDeptController-checkDeptNameUnique | POST /system/dept/checkDeptNameUnique | SysDeptController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysDictTypeController-selectDictTree | GET /system/dict/selectDictTree/{columnId}/{dictType} | SysDictTypeController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysDictTypeController-treeData | GET /system/dict/treeData | SysDictTypeController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysIndexController-index | GET /index | SysIndexController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysIndexController-lockscreen | GET /lockscreen | SysIndexController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysIndexController-unlockscreen | POST /unlockscreen | SysIndexController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysIndexController-switchSkin | GET /system/switchSkin | SysIndexController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysIndexController-menuStyle | GET /system/menuStyle/{style} | SysIndexController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysIndexController-main | GET /system/main | SysIndexController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysJobController-checkCronExpressionIsValid | POST /monitor/job/checkCronExpressionIsValid | SysJobController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysJobController-cron | GET /monitor/job/cron | SysJobController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysJobController-queryCronExpression | GET /monitor/job/queryCronExpression | SysJobController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysLoginController-login | GET /login | SysLoginController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysLoginController-ajaxLogin | POST /login | SysLoginController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysLoginController-unauth | GET /unauth | SysLoginController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysMenuController-updateSort | POST /system/menu/updateSort | SysMenuController | **高危**：写操作缺少权限码校验 |
| API-SysMenuController-icon | GET /system/menu/icon | SysMenuController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysMenuController-checkMenuNameUnique | POST /system/menu/checkMenuNameUnique | SysMenuController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysMenuController-roleMenuTreeData | GET /system/menu/roleMenuTreeData | SysMenuController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysMenuController-menuTreeData | GET /system/menu/menuTreeData | SysMenuController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysMenuController-selectMenuTree | GET /system/menu/selectMenuTree/{menuId} | SysMenuController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysPostController-checkPostNameUnique | POST /system/post/checkPostNameUnique | SysPostController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysPostController-checkPostCodeUnique | POST /system/post/checkPostCodeUnique | SysPostController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysProfileController-checkPassword | GET /system/user/profile/checkPassword | SysProfileController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysProfileController-resetPwd | GET /system/user/profile/resetPwd | SysProfileController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysProfileController-resetPwd-2 | POST /system/user/profile/resetPwd | SysProfileController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysProfileController-edit | GET /system/user/profile/edit | SysProfileController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysProfileController-avatar | GET /system/user/profile/avatar | SysProfileController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysProfileController-update | POST /system/user/profile/update | SysProfileController | **高危**：写操作缺少权限码校验 |
| API-SysProfileController-updateAvatar | POST /system/user/profile/updateAvatar | SysProfileController | **高危**：写操作缺少权限码校验 |
| API-SysRegisterController-register | GET /register | SysRegisterController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysRegisterController-ajaxRegister | POST /register | SysRegisterController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysRoleController-authDataScope | GET /system/role/authDataScope/{roleId} | SysRoleController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysRoleController-checkRoleKeyUnique | POST /system/role/checkRoleKeyUnique | SysRoleController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysRoleController-selectMenuTree | GET /system/role/selectMenuTree | SysRoleController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysUserController-checkLoginNameUnique | POST /system/user/checkLoginNameUnique | SysUserController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysUserController-checkPhoneUnique | POST /system/user/checkPhoneUnique | SysUserController | 低危：查询/渲染或唯一性校验辅助接口 |
| API-SysUserController-checkEmailUnique | POST /system/user/checkEmailUnique | SysUserController | 低危：查询/渲染或唯一性校验辅助接口 |

## 4. 相关文档

- 功能主定义：[`functional-inventory.md`](./functional-inventory.md)
- 实现主链：[`function-chain-index.md`](./function-chain-index.md)
- 表读写矩阵：[`database-access-matrix.md`](./database-access-matrix.md)
- 配置索引：[`config-index.md`](./config-index.md)
