// gen-interface-index.js — generates interface-index.md, the primary definition file
// for every API-*/JOB-* node. Derived deterministically from semantics.json + assets.json.
const fs = require('fs');
const { writeText } = require('./write-crlf');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const outDir = path.join(ROOT, 'docs/meta-model');
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); }
const sem = readJson(path.join(ROOT, 'docs/tools/semantics.json'));
const assets = readJson(path.join(ROOT, 'docs/tools/assets.json'));

// ---- map controller -> function id (must match gen-core-docs.js catalog) ----
const controllerToFn = {
  SysLoginController: ['FUNC-sys-login', 'FUNC-sys-logout'],
  SysCaptchaController: ['FUNC-sys-captcha'],
  SysRegisterController: ['FUNC-sys-register'],
  SysIndexController: ['FUNC-sys-index', 'FUNC-sys-unauth'],
  SysProfileController: ['FUNC-sys-profile', 'FUNC-sys-profile-avatar'],
  SysUserController: ['FUNC-sys-user-manage'],
  SysRoleController: ['FUNC-sys-role-manage'],
  SysMenuController: ['FUNC-sys-menu-manage'],
  SysDeptController: ['FUNC-sys-dept-manage'],
  SysPostController: ['FUNC-sys-post-manage'],
  SysDictTypeController: ['FUNC-sys-dict-manage'],
  SysDictDataController: ['FUNC-sys-dict-manage'],
  SysConfigController: ['FUNC-sys-config-manage'],
  SysNoticeController: ['FUNC-sys-notice-manage'],
  SysJobController: ['FUNC-job-manage'],
  SysJobLogController: ['FUNC-job-log-query'],
  CommonController: ['FUNC-common-upload', 'FUNC-common-download'],
  OpenAppController: ['FUNC-open-app-manage'],
  OpenApiMgrController: ['FUNC-open-api-manage'],
  OpenAuthController: ['FUNC-open-auth-manage'],
  OpenLogController: ['FUNC-open-log-query'],
  OpenDocController: ['FUNC-open-doc-manage'],
  OpenGatewayController: ['FUNC-open-gateway-invoke'],
  OpenSelftestHttpbinController: ['FUNC-open-selftest'],
};

// ---- table touched per controller (for the Physical tables field) ----
const controllerTables = {
  SysLoginController: 'sys_user（R/U）、sys_logininfor（C）、sys_user_online（C）',
  SysCaptchaController: '无',
  SysRegisterController: 'sys_user（C）',
  SysIndexController: 'sys_menu（R）',
  SysProfileController: 'sys_user（R/U）',
  SysUserController: 'sys_user（R/C/U/D）、sys_user_role（R/C/D）、sys_user_post（R/C/D）、sys_dept（R）、sys_role（R）、sys_post（R）',
  SysRoleController: 'sys_role（R/C/U/D）、sys_role_menu（R/C/D）、sys_role_dept（R/C/D）、sys_user_role（R）',
  SysMenuController: 'sys_menu（R/C/U/D）、sys_role_menu（R）',
  SysDeptController: 'sys_dept（R/C/U/D）、sys_user（R）',
  SysPostController: 'sys_post（R/C/U/D）、sys_user_post（R）',
  SysDictTypeController: 'sys_dict_type（R/C/U/D）',
  SysDictDataController: 'sys_dict_data（R/C/U/D）',
  SysConfigController: 'sys_config（R/C/U/D）',
  SysNoticeController: 'sys_notice（R/C/U/D）',
  SysJobController: 'sys_job（R/C/U/D）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）',
  SysJobLogController: 'sys_job_log（R/D）',
  CommonController: '无（文件系统）',
  OpenAppController: 'open_app（R/C/U/D）、open_app_api（R/C/D）',
  OpenApiMgrController: 'open_api（R/C/U/D）、open_app_api（R）、open_api_doc（R）',
  OpenAuthController: 'open_app_api（R/C/U/D）、open_app（R）、open_api（R）',
  OpenLogController: 'open_call_log（R）',
  OpenDocController: 'open_api_doc（R/C/U/D）、open_api（R）',
  OpenGatewayController: 'open_app（R）、open_api（R）、open_app_api（R）、open_call_log（C）',
  OpenSelftestHttpbinController: '无（自检被调端）',
};

// ---- build API nodes with unique ids ----
const groups = new Map();
for (const e of sem.Endpoints) {
  if (!groups.has(e.Controller)) groups.set(e.Controller, []);
  groups.get(e.Controller).push(e);
}
const apiNodes = [];
const usedIds = new Set();
for (const [controller, eps] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
  for (const e of eps) {
    const segs = e.FullPath.split('/').filter(Boolean);
    const action = e.Method !== 'unknown' ? e.Method.replace(/[^A-Za-z0-9]/g, '') : (segs[segs.length - 1] || 'root').replace(/[^A-Za-z0-9]/g, '');
    let id = `API-${controller}-${action}`;
    let n = 2;
    while (usedIds.has(id)) { id = `API-${controller}-${action}-${n}`; n++; }
    usedIds.add(id);
    apiNodes.push({ id, controller, ep: e });
  }
}

// ---- extra non-controller API/JOB nodes documented as primary definitions ----
const extras = [
  { id: 'API-open-gateway', type: 'REST', direction: 'inbound', proto: 'ALL /open/**（具体前缀由 OpenGatewayController 与其过滤器决定）', provider: 'com.qvsu.open.controller.OpenGatewayController + com.qvsu.open.filter', consumer: 'FUNC-open-gateway-invoke', tables: 'open_app（R）、open_api（R）、open_app_api（R）、open_call_log（C）' },
  { id: 'API-global-exception', type: 'INTERNAL', direction: 'internal', proto: '@ControllerAdvice 全局异常拦截', provider: 'com.qvsu.framework.web.exception.GlobalExceptionHandler', consumer: 'FUNC-global-exception', tables: '无' },
  { id: 'API-common-upload', type: 'REST', direction: 'inbound', proto: 'POST /common/upload', provider: 'com.qvsu.web.controller.common.CommonController', consumer: 'FUNC-common-upload', tables: '无（文件系统）' },
  { id: 'API-common-download', type: 'REST', direction: 'inbound', proto: 'GET /common/download、GET /common/download/resource', provider: 'com.qvsu.web.controller.common.CommonController', consumer: 'FUNC-common-download', tables: '无（文件系统）' },
  { id: 'API-captcha-image', type: 'REST', direction: 'inbound', proto: 'GET /captcha/captchaImage', provider: 'com.qvsu.web.controller.system.SysCaptchaController', consumer: 'FUNC-sys-captcha', tables: '无（会话内存）' },
  { id: 'API-open-selftest-echo', type: 'REST', direction: 'internal', proto: 'GET/POST/PUT/DELETE /selftest/httpbin/**', provider: 'com.qvsu.open.controller.OpenSelftestHttpbinController', consumer: 'FUNC-open-selftest', tables: '无' },
  { id: 'API-joblog-list', type: 'REST', direction: 'inbound', proto: 'POST /monitor/jobLog/list（由 SysJobLogController 提供）', provider: 'com.qvsu.quartz.controller.SysJobLogController', consumer: 'FUNC-job-log-query', tables: 'sys_job_log（R/D）' },
  { id: 'JOB-quartz-dispatch', type: 'BATCH', direction: 'internal', proto: 'Quartz 调度器按 Cron 触发，反射调用 sys_job.invoke_target', provider: 'com.qvsu.quartz.config + com.qvsu.quartz.service.impl.SysJobServiceImpl', consumer: 'FUNC-job-scheduler', tables: 'sys_job（R/U）、sys_job_log（C）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）、QRTZ_CRON_TRIGGERS（R）' },
];

const totalNodes = apiNodes.length + extras.length;

// ---- render ----
const L = [];
L.push('# 接口清单（Interface Index）');
L.push('');
L.push('> 产物语言：zh-CN ｜ 本文件是全部 `API-*` 与 `JOB-*` 稳定 ID 的**唯一主定义位置**。');
L.push('');
L.push(`共 ${totalNodes} 个接口节点：${apiNodes.length} 个 HTTP 端点（来自 24 个 Controller 的注解扫描）+ ${extras.length} 个非端点型接口（网关聚合入口、全局异常、Quartz 调度入口、由框架或未纳入扫描的控制器提供的监控接口）。`);
L.push('');
L.push('## 0. 接口总览');
L.push('');
L.push('| 接口 ID | 类型 | 方向 | 协议标识 | 提供者 | 消费者功能 |');
L.push('|---|---|---|---|---|---|');
for (const n of apiNodes) {
  const fns = controllerToFn[n.controller] || [];
  L.push(`| ${n.id} | REST | inbound | ${n.ep.HttpMethod} ${n.ep.FullPath} | ${n.controller} | ${fns.join(', ') || '-'} |`);
}
for (const x of extras) {
  L.push(`| ${x.id} | ${x.type} | ${x.direction} | ${x.proto} | ${x.provider} | ${x.consumer} |`);
}
L.push('');
L.push('## 1. HTTP 端点主定义');
L.push('');
for (const n of apiNodes) {
  const e = n.ep;
  const fns = controllerToFn[n.controller] || [];
  const perm = e.Permission;
  L.push(`## ${n.id} - ${e.HttpMethod} ${e.FullPath}`);
  L.push('');
  L.push(`- ID: ${n.id}`);
  L.push(`- 类型: REST`);
  L.push(`- 方向: inbound`);
  L.push(`- 协议标识: ${e.HttpMethod} ${e.FullPath}`);
  L.push(`- 提供者: \`com.qvsu\` 下 \`${e.Path}\` 的 \`${e.Controller}.${e.Method}\``);
  L.push(`- 消费者功能: ${fns.join(', ') || '（未归属）'}`);
  L.push(`- Controller/Provider/Consumer/Client: ${e.Controller}`);
  L.push(`- 请求对象: ${/\/add|\/edit|\/save|\/remove|\/changeStatus|\/resetPwd|\/importData|\/update/.test(e.FullPath) ? '表单参数或同名实体（' + e.Controller.replace('Controller', '') + '）' : '查询参数 / 分页参数'}`);
  L.push(`- 响应对象: ${/\/list|allocatedList|unallocatedList|selectUser/.test(e.FullPath) ? 'TableDataInfo（分页表格）' : 'AjaxResult（统一操作结果）'}`);
  L.push(`- 认证与权限: ${perm ? 'Shiro 会话认证 + 权限码 `' + perm + '`' : '仅 Shiro 会话认证（无独立权限码，属权限覆盖缺口）'}`);
  L.push(`- 幂等与重放: ${e.HttpMethod === 'GET' ? '查询/渲染，天然幂等' : '写操作按业务主键判重，未实现显式幂等令牌'}`);
  L.push(`- 调用下游: 同模块 Service → Mapper → 物理表；详见 [\`function-chain-index.md\`](./function-chain-index.md)`);
  L.push(`- 物理表操作: ${controllerTables[e.Controller] || 'unknown'}`);
  L.push(`- 兼容性风险: ${e.HttpMethod === 'GET' && /\/remove|\/edit/.test(e.FullPath) ? '写操作使用 GET 语义，存在被预取/爬虫误触发的风险，且不便做 CSRF 防护' : '路径或参数变更会同步影响前端模板中的硬编码 URL'}`);
  L.push(`- 证据: \`open-api/${e.Path}\` 的 \`@@${e.HttpMethod === 'GET' ? 'GetMapping' : e.HttpMethod === 'POST' ? 'PostMapping' : e.HttpMethod === 'PUT' ? 'PutMapping' : e.HttpMethod === 'DELETE' ? 'DeleteMapping' : 'RequestMapping'}("${e.Token}")\``);
  L.push('');
}
L.push('## 2. 非端点型接口主定义');
L.push('');
for (const x of extras) {
  L.push(`## ${x.id} - ${x.type} 接口`);
  L.push('');
  L.push(`- ID: ${x.id}`);
  L.push(`- 类型: ${x.type}`);
  L.push(`- 方向: ${x.direction}`);
  L.push(`- 协议标识: ${x.proto}`);
  L.push(`- 提供者: ${x.provider}`);
  L.push(`- 消费者功能: ${x.consumer}`);
  L.push(`- Controller/Provider/Consumer/Client: ${x.provider}`);
  L.push(`- 请求对象: 见 [\`domain-model.md\`](./domain-model.md) 对应对象`);
  L.push(`- 响应对象: ${x.type === 'BATCH' ? '无（调度器内部调用）' : 'AjaxResult 或业务响应体'}`);
  L.push(`- 认证与权限: ${x.id === 'API-open-gateway' ? '开放平台独立鉴权链路（应用凭据 + 接口授权校验），不走 Shiro 会话' : x.type === 'REST' ? 'Shiro 会话认证 + 对应权限码' : '系统内部调用'}`);
  L.push(`- 幂等与重放: ${x.type === 'BATCH' ? '按 Cron 触发，异常不重试' : '依赖业务主键'}`);
  L.push(`- 调用下游: 见 [\`function-chain-index.md\`](./function-chain-index.md) 中 ${x.consumer}`);
  L.push(`- 物理表操作: ${x.tables}`);
  L.push(`- 兼容性风险: ${x.id === 'API-open-gateway' ? '对外契约，字段或鉴权方式变更将破坏所有已接入的第三方应用' : '内部契约，变更影响面可控'}`);
  L.push(`- 证据: ${x.id === 'API-open-gateway' ? '`com.qvsu.open.controller.OpenGatewayController` 与 `com.qvsu.open.filter` 源码' : x.id === 'JOB-quartz-dispatch' ? '`com.qvsu.quartz.config` 与 `SysJobServiceImpl` 源码' : '源码扫描'}`);
  L.push('');
}
L.push('## 3. 端点权限覆盖缺口');
L.push('');
const noPerm = apiNodes.filter(n => !n.ep.Permission);
L.push(`在 ${apiNodes.length} 个 HTTP 端点中，有 ${noPerm.length} 个未标注 \`@RequiresPermissions\`。逐个列出如下（这些端点仅受 Shiro 会话认证保护，属需要复核的权限缺口）：`);
L.push('');
L.push('| 接口 ID | 端点 | 提供者 | 风险判断 |');
L.push('|---|---|---|---|');
for (const n of noPerm) {
  const risky = /remove|editSave|addSave|save|changeStatus|resetSecret|generate|update/.test(n.ep.FullPath);
  L.push(`| ${n.id} | ${n.ep.HttpMethod} ${n.ep.FullPath} | ${n.controller} | ${risky ? '**高危**：写操作缺少权限码校验' : '低危：查询/渲染或唯一性校验辅助接口'} |`);
}
L.push('');
L.push('## 4. 相关文档');
L.push('');
L.push('- 功能主定义：[`functional-inventory.md`](./functional-inventory.md)');
L.push('- 实现主链：[`function-chain-index.md`](./function-chain-index.md)');
L.push('- 表读写矩阵：[`database-access-matrix.md`](./database-access-matrix.md)');
L.push('- 配置索引：[`config-index.md`](./config-index.md)');
L.push('');
writeText(path.join(outDir, 'interface-index.md'), L.join('\n'));

console.log('interface-index.md written');
console.log('  HTTP endpoint nodes : ' + apiNodes.length);
console.log('  extra nodes         : ' + extras.length);
console.log('  endpoints w/o perm  : ' + noPerm.length);
console.log('  unique ids          : ' + (usedIds.size + extras.length) + ' / ' + totalNodes);
