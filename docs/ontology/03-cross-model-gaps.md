# 本体模型跨模型引用差异报告（Cross-Model Reconciliation Gap Report）

> 由 `docs/tools/ontology-gap-report.js` 依据 `docs/tools/ontology-analysis.json` 渲染；
> 分析数据由 `docs/tools/analyze-ontology.js` 产出，两者共用同一份解析结果，计数不会互相矛盾。

## 1. 结论摘要

七模型 YAML（M1/M2/M3/M5/M6/M7/MU）**全部可解析、结构完整**（python `yaml.safe_load` 逐个通过，`model_type` 分别为 OBJECT/BEHAVIOR/RULE/ACTOR/FLOW/REPORT/UI）。

但**跨模型引用尚未闭环**：各模型由独立建模过程产出、ID 体系不同，因此存在系统性命名差异。

| 指标 | 数值 |
|---|---:|
| YAML 文件数 | 7 |
| 模型内已定义 ID 总数 | 508 |
| 引用总数 | 445 |
| 已解析引用 | 197 |
| **未解析引用** | **248** |
| M2 行为总数 | 110 |
| 被 MU / M7 引用的 M2 行为 | 83 |
| **未被任何 UI / 报表引用的 M2 行为** | **27** |

这**不是解析失败**，而是需要区分性质的两类问题：

1. **真实建模缺口（层级不一致）**：技能一致性门禁要求「M2 `triggerType=USER_ACTION` 行为须被至少一个 MU 操作功能点引用」。本项目的 M2 建成**业务级行为**（如 `SysUser_Add`），MU 却建到 **UI 级交互**（如 `SysUser_SaveForm`、`SysUser_OpenPage`、`SysUser_ResetQuery`）。两层之间存在层级差，故 MU 的部分 `behaviorRef` 在 M2 中本就不存在。
2. **命名空间未对齐**：M7 的 `interfaceRef` 指向**逆向元模型**的 `API-*` 节点；`parameterRef` 使用字段名；M1 值对象使用中文名。这些在本体 YAML 内没有对应命名空间。

## 2. 未解析引用的原因分布

| 原因 | 条数 | 占比 | 处理建议 |
|---|---:|---:|---|
| M2 未建模的 UI 级动作 | 80 | 32.3% | 在 M2 补齐 UI 级 USER_ACTION 行为，或在 MU 改引业务级行为（二选一，保持一致） |
| parameterRef 为字段名，非全局 ID | 74 | 29.8% | 在 M1 属性上建立字段名索引，使 parameterRef 可解析 |
| M2 命名不同（业务级行为） | 47 | 19.0% | 建立别名映射表并回写 MU / M7 |
| M5 角色/权限 ID 命名不同 | 20 | 8.1% | 统一角色与权限 ID 命名空间（ROLE-* / 权限码） |
| valueObjectRef 使用中文名，M1 值对象未分配 ID | 15 | 6.0% | 为 M1 值对象分配 VO-* ID 并回写引用 |
| interfaceRef 指向逆向元模型的 API-*（本体内无该命名空间） | 12 | 4.8% | 在 M7 头部声明 interfaceRef 的命名空间为逆向元模型，或改写为 M2 行为引用 |

## 3. 按文件与引用类型的未解析分布

| 文件 | 引用类型 | 未解析数 |
|---|---|---:|
| `mu-ui-model.yaml` | behaviorRef | 127 |
| `m7-report-model.yaml` | parameterRef | 56 |
| `m6-flow-model.yaml` | roleRef | 20 |
| `mu-ui-model.yaml` | screenRef | 18 |
| `m1-object-model.yaml` | valueObjectRef | 15 |
| `m7-report-model.yaml` | interfaceRef | 12 |

| 文件 | 合计 |
|---|---:|
| `mu-ui-model.yaml` | 145 |
| `m7-report-model.yaml` | 68 |
| `m6-flow-model.yaml` | 20 |
| `m1-object-model.yaml` | 15 |

## 4. M2 行为被引用情况（技能门禁对账）

以下 **27** 个 M2 行为未被任何 MU 界面或 M7 报表引用。按技能门禁，这些行为在 UI 层缺少落点，需要补充 MU 引用，或确认其为系统级触发（此时应从 USER_ACTION 改为相应触发类型）：

- `SysUserOnline_Logout`
- `SysCaptcha_Generate`
- `SysUser_Register`
- `SysIndex_ShowUnauth`
- `SysUser_UpdateProfile`
- `SysUser_UpdateAvatar`
- `SysUser_Export`
- `SysUser_Import`
- `SysRole_Export`
- `SysPost_Export`
- `SysDict_CacheRefresh`
- `SysConfig_Export`
- `SysOperLog_QueryPage`
- `SysOperLog_Clean`
- `SysLogininfor_QueryPage`
- `SysLogininfor_Clean`
- `SysUser_Unlock`
- `SysUserOnline_QueryPage`
- `SysUserOnline_ForceLogout`
- `SysUserPost_Grant`
- `SysRoleDept_Grant`
- `GlobalException_Handle`
- `Job_Export`
- `Job_Edit`
- `Job_Remove`
- `JobLog_Export`
- `JobLog_Clean`

## 5. 与官方校验器的命名空间冲突（潜在风险，当前未触发）

官方校验器的 ID 正则使用 `\b` 词边界，而 `-` 也是词边界，因此形如 `AGG-SYS-USER-001` 的 ID **会被解析出** `SYS-USER-001`，`AGG-OPEN-API-001` 会被解析出 `API-001`。本项目中：

| 项 | 值 |
|---|---:|
| 与校验器前缀冲突的本体 ID 数 | 47 |
| 当前是否影响校验结论 | **否** |

**为什么不影响**：校验器只扫描 `-MetaModelPath`（本次为 `docs/meta-model`）下的 Markdown，而七模型 YAML 位于 `docs/ontology/yaml/`，不在扫描范围内。所有 25 个元模型文件都不含任何完整本体 ID（已核验为 0 处引用）。

**何时会触发**：若将来把本体 YAML 或引用本体 ID 的文档放入 `docs/meta-model`，校验器会把这些碎片当作 `SYS-*` / `MENU-*` / `API-*` 引用并要求主定义，从而产生大量误报。规避办法是在**本体命名空间内不要使用 `SYS-`、`MENU-`、`API-` 等作为中段**，或保持本体目录与校验目录分离。

## 6. 建议的收敛路径

1. **建立共享 ID 注册表**：在 `docs/ontology/` 增加 `id-registry.md`，规定每类对象的 ID 格式与命名空间归属，七个模型共同遵守。
2. **补 UI 级行为或改引业务级行为**：把 MU 中高频 UI 动作（`OpenPage` / `SaveForm` / `CloseForm` / `ResetQuery` / `QueryList` / `ExportExcel`）在 M2 补齐为 `USER_ACTION` 行为，或让 MU 直接引用业务级行为。二选一，但必须全量一致。
3. **对齐逆向 ID**：在 M1 / M7 中显式声明与逆向元模型 ID（`OBJ-*`、`API-*`、`TBL-*`）的映射字段（如 `legacyObjectRef`、`legacyApiRef`），使本体与逆向结果可双向追溯。
4. **字段名索引**：为 M1 属性建立字段名 → 属性 ID 索引，使 `parameterRef` 可解析。
5. **复验**：收敛后重跑 `node docs/tools/analyze-ontology.js`，目标为「未解析引用 = 0」且「M2 孤儿行为 = 0」。

## 7. 明确不掩盖的结论

本体模型当前**未通过技能的一致性门禁**：248 条跨模型引用无法解析，27 个 M2 行为未被 UI 引用。

模型本身可解析、结构完整、内容可用于后续开发与阅读，但**不能声明为"已闭环"**。本报告与 `PROGRESS.md` 的 `Q-*` 条目共同构成未决问题台账。

