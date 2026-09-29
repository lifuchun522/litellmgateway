# MU UI 模型元文件 - mu-ui-model.yaml
model_type: UI
version: "1.0"
domain: "销售合同执行管理"

application:
  name: 销售合同执行管理系统
  menus:
    - menuId: menu-contract
      name: 合同管理
      children:
        - menuId: menu-contract-maintain
          name: 合同维护
          screenRef: frmContractMaintain
        - menuId: menu-contract-query
          name: 合同查询
          screenRef: frmContractQuery
    - menuId: menu-invoice
      name: 开票管理
      children:
        - menuId: menu-invoice-maintain
          name: 开票录入
          screenRef: frmInvoiceMaintain
        - menuId: menu-invoice-query
          name: 开票查询
          screenRef: frmInvoiceQuery
    - menuId: menu-receipt
      name: 收款管理
      children:
        - menuId: menu-receipt-maintain
          name: 收款录入
          screenRef: frmReceiptMaintain
    - menuId: menu-report
      name: 报表中心
      children:
        - menuId: menu-report-execution
          name: 合同执行情况分析
          screenRef: frmContractExecutionReport
        - menuId: menu-report-dept
          name: 部门合同统计报表
          screenRef: frmDeptContractReport
    - menuId: menu-masterdata
      name: 基础数据
      children:
        - menuId: menu-masterdata-product
          name: 产品信息维护
          screenRef: frmProductMaintain
        - menuId: menu-masterdata-customer
          name: 客户信息维护
          screenRef: frmCustomerMaintain
        - menuId: menu-masterdata-department
          name: 部门信息维护
          screenRef: frmDepartmentMaintain
        - menuId: menu-masterdata-employee
          name: 人员信息维护
          screenRef: frmEmployeeMaintain

screens:
  - screenId: frmContractMaintain
    name: 合同录入
    screenType: MASTER_DETAIL_FORM
    layout: |
      ┌──────────────────────────────────────────────────────────────┐
      │ 合同录入（主从表）                                [btnExit]   │
      ├──────────────────────────────────────────────────────────────┤
      │ 合同编号:[txtContractNo]  合同名称:[txtContractName]  合同类型:(cboContractType) │
      │ 所属产品:[pslProduct]     所属客户:[pslCustomer]      签订时间:{dtpSignDate}     │
      │ 所属部门:[pslDepartment]  责任人:[pslOwner]           合同总金额:[txtTotalAmount]│
      ├──────────────────────────────────────────────────────────────┤
      │ 付款阶段（从表，表格内动态维护）                              │
      │ @grdPaymentStage                                              │
      │  阶段编号 | 阶段名称 | 付款比例 | [删除]                       │
      │  [btnAddRow]                                                  │
      ├──────────────────────────────────────────────────────────────┤
      │ [btnSave] [btnSubmit] [btnCancel]                             │
      └──────────────────────────────────────────────────────────────┘
    elements:
      - id: txtContractNo
        type: TEXTBOX
        label: 合同编号
        io: I
        required: true
        dataBinding: Contract.contractNo
      - id: txtContractName
        type: TEXTBOX
        label: 合同名称
        io: I
        required: true
        dataBinding: Contract.contractName
      - id: cboContractType
        type: COMBO
        label: 合同类型
        io: I
        required: true
        dataBinding: Contract.contractType
      - id: pslProduct
        type: POPUP_SELECT
        label: 所属产品
        io: I
        required: true
        dataBinding: Contract.productId
      - id: pslCustomer
        type: POPUP_SELECT
        label: 所属客户
        io: I
        required: true
        dataBinding: Contract.customerId
      - id: dtpSignDate
        type: DATEPICKER
        label: 签订时间
        io: I
        required: true
        dataBinding: Contract.signDate
      - id: pslDepartment
        type: POPUP_SELECT
        label: 所属部门
        io: I
        required: true
        dataBinding: Contract.departmentId
      - id: pslOwner
        type: POPUP_SELECT
        label: 责任人
        io: I
        required: true
        dataBinding: Contract.ownerId
      - id: txtTotalAmount
        type: NUMBER
        label: 合同总金额
        io: I
        required: true
        dataBinding: Contract.totalAmount
      - id: grdPaymentStage
        type: GRID
        label: 付款阶段
        io: I_O
        dataBinding: Contract.stages
      - id: btnAddRow
        type: BUTTON
        label: 新增行
      - id: btnExit
        type: BUTTON
        label: 退出

    actions:
      - actionId: actSaveDraft
        name: 保存草稿
        actionType: DRAFT
        behaviorRef: Contract_SaveAsDraft
        permissionRef: [PERM-CONTRACT-CREATE]
      - actionId: actSubmit
        name: 提交
        actionType: SUBMIT
        behaviorRef: Contract_Submit
        permissionRef: [PERM-CONTRACT-CREATE]
      - actionId: actCancel
        name: 取消
        actionType: BUTTON
        behaviorRef: Contract_Cancel

  - screenId: frmContractQuery
    name: 合同信息查询
    screenType: QUERY_LIST
    layout: |
      ┌──────────────────────────────────────────────────────────────┐
      │ 合同信息查询                                            [btnExit] │
      ├──────────────────────────────────────────────────────────────┤
      │ 合同编号:[txtContractNo]  合同名称:[txtContractName]  合同类型:(cboContractType) │
      │ 所属部门:[pslDepartment]  签订时间从:{dtpStart}  到:{dtpEnd}     │
      │ [btnQuery] [btnReset]                                         │
      ├──────────────────────────────────────────────────────────────┤
      │ @grdResult                                                    │
      │  合同编号 | 合同名称 | 合同类型 | 合同金额 | 责任人 | 客户 | 部门 │
      │ [分页: 共N条 | 第1/20页 | 上一页 | 下一页]                     │
      └──────────────────────────────────────────────────────────────┘
    elements:
      - id: txtContractNo
        type: TEXTBOX
        label: 合同编号
        io: I
        dataBinding: Contract.contractNo
      - id: txtContractName
        type: TEXTBOX
        label: 合同名称
        io: I
        dataBinding: Contract.contractName
      - id: cboContractType
        type: COMBO
        label: 合同类型
        io: I
        dataBinding: Contract.contractType
      - id: pslDepartment
        type: POPUP_SELECT
        label: 所属部门
        io: I
        dataBinding: Contract.departmentId
      - id: dtpStart
        type: DATEPICKER
        label: 签订时间从
        io: I
      - id: dtpEnd
        type: DATEPICKER
        label: 到
        io: I
      - id: grdResult
        type: GRID
        label: 查询结果
        io: O
        dataSource: REP-CONTRACT-LIST
      - id: btnQuery
        type: BUTTON
        label: 查询
      - id: btnReset
        type: BUTTON
        label: 重置

    actions:
      - actionId: actQuery
        name: 查询
        actionType: BUTTON
        behaviorRef: Contract_QueryList
        permissionRef: [PERM-CONTRACT-QUERY]
      - actionId: actReset
        name: 重置
        actionType: BUTTON
        behaviorRef: Contract_ResetQuery
```

## 8.7  一致性约束（MU 门禁）

1. `element.dataBinding` 字段路径必须可解析到 M1 聚合属性；
2. `element.dataSource` 引用的 M7 对象必须存在；
3. 操作功能点 `behaviorRef` 引用的 M2 行为必须存在；
4. 带审批流的功能屏幕必须同时包含 `DRAFT` 与 `SUBMIT` 两个功能点；
5. **反向门禁**：M2 中 `triggerType=USER_ACTION` 的行为必须被至少一个 MU 操作功能点引用；
6. 控件类型必须遵循 §8.3 映射规则（日期→DATEPICKER、枚举/字典→COMBO、对象引用→POPUP_SELECT）；
7. 屏幕布局必须遵循 §8.4 布局规则（单表 2 列、主从主表 3 列 + 从表表格、查询条件 3 列 + 结果表格分页、**列表维护界面为「工具栏 + 列表」且新增/编辑走弹窗**）；
8. `layout` 中出现的 elementId 必须存在于该屏幕 `elements`，且 `io`/`required` 标注一致；
9. 二级菜单必须关联屏幕，且每级一级菜单下至少存在一个二级菜单。

---

# 第九章  传统需求覆盖度分析

## 9.1  与软件需求规格说明书的映射

| 需求维度 | 覆盖程度 | 承载模型 |
|----------|----------|----------|
| 领域概念、数据及聚合边界 | 完整覆盖 | M1 对象模型 |
| 原子功能、命令与查询入口 | 完整覆盖 | M2 行为模型 |
| 业务规则与一致性约束 | 完整覆盖 | M1 内置约束、refRules、invariants + M3 规则模型 |
| 跨对象同步联动 | 完整覆盖 | M2 `syncTriggers` + M3 规则（被同步调用） |
| 角色、权限 | 完整覆盖 | M5 主体模型；权限通过 M2 行为授权 |
| 端到端业务协同流 | 完整覆盖 | M6 `COLLABORATION` 流程 |
| 人工审批流 | 完整覆盖 | M6 `APPROVAL` 流程 + M5 角色 |
| 跨对象查询、统计分析 | 完整覆盖 | M7 查询统计对象 + 一对一 M2 QUERY 行为 |
| 固定业务报表 | 完整覆盖 | M7 REPORT 对象 + 一对一 M2 QUERY 行为 |
| 菜单导航与界面布局 | 完整覆盖 | MU UI 模型（菜单树 + ASCII 布局 + 操作功能点） |
| 异常、驳回、退回路径 | 主要语义覆盖 | M2 前后置条件、M6 分支与终止路径 |
| 对象到数据库表的映射 | 框架外 | 实现阶段以 ORM 注解或 DDL 直接落地 |
| 本系统对外接口 / 外部接口 | 框架外（明确排除） | 本系统当前无外部系统交互 |
| 性能、容量、可用性、安全基线等 NFR | 框架外 | 非功能需求规格 |
| BI 数仓、自助分析和指标平台 | 明确排除 | M7 不是 BI 指标模型 |

## 9.2  覆盖结论

对于合同管理、资产管理、CRM 等采用单体同步部署的中小型业务系统，本框架能够承载软件需求中的核心业务语义：领域对象及聚合边界、原子用例、业务规则、角色权限、端到端流程、审批流程、跨对象同步联动、跨对象查询统计和固定报表，以及界面菜单导航与操作入口。

本框架不应被视为一份完整 SRS 的唯一物理载体。完整交付仍应把七模型与非功能需求、数据迁移、部署运维和测试验收标准组合起来。七模型完整覆盖"系统做什么、核心业务为何如此运转、用户如何驱动系统"，配套规格覆盖"达到什么质量目标以及如何部署运行"。

## 9.3  DDD 与同步编排架构体现

- M1 以聚合根、不变性、值对象和聚合间 ID 引用落实 DDD 领域边界；
- M2 把应用能力拆成原子行为，区分命令与查询；
- M2 `syncTriggers` 把跨聚合联动显式建模为同步调用链，保持事务一致性；
- M3 把业务判断从行为中分离，被同步调用、可独立复用与版本管理；
- M6 承担显式流程控制，并通过角色、行为、规则及子流程组合业务旅程；
- M7 将跨聚合读模型与写侧聚合解耦，体现 CQRS 式读写职责分离，但不引入独立 BI 数据模型；
- MU 将界面入口与业务行为解耦，操作功能点通过稳定 ID 引用行为。

## 9.4  已知边界

- **UI/UX**：MU 承载菜单导航、屏幕结构、元素与操作功能点；不建模视觉样式、动画、无障碍、主题与终端适配；
- **数据库映射**：对象到物理表/字段的映射由实现阶段 ORM/DDL 落地，不在本体层建模；
- **接口**：本系统不涉及外部接口，接口契约不建模；如未来需要对接外部系统，可后续补充；
- 不独立建模性能、容量、可靠性、安全合规等可量化质量属性；
- 不定义消息中间件、事件存储或事件溯源实现；
- 不定义数据仓库、指标平台、即席分析或可视化仪表盘。

---

# 第十章  实施指南与最佳实践

## 10.1  建模顺序推荐

七个模型之间存在依赖，建议按以下顺序建模：

| 阶段 | 建模对象 | 说明 |
|------|----------|------|
| 1 | M1 对象模型 | 识别聚合、属性、关联、内置约束、refRules 和 invariants |
| 2 | M5 主体模型（角色） | 识别内部角色及职责边界，权限可稍后补齐 |
| 3 | M3 规则模型 | 梳理跨对象、跨行为或需要独立复用的规则 |
| 4 | M2 行为模型 | 定义对象行为、规则调用、syncTriggers 联动及查询行为入口 |
| 5 | M7 查询统计与报表模型 | 在 M1 字段和 M2 查询行为稳定后，建立严格一对一查询报表定义 |
| 6 | M5 主体模型（权限） | 定义权限并绑定 M2 行为；M7 不直接绑定权限 |
| 7 | M6 流程模型 | 定义端到端协同流和审批流，引用角色、行为、规则及子流程 |
| 8 | MU UI 模型 | 定义菜单树、屏幕、ASCII 布局与操作功能点，引用 M2 行为，并反向校验可追溯性 |

## 10.2  模型评审检查清单

### M1 对象模型评审
- [ ] 聚合边界是否清晰？每个聚合根是否代表一个完整的业务概念？
- [ ] 聚合内的子实体是否真的需要与聚合根同生共死？
- [ ] 聚合之间是否通过 ID 引用而非对象引用？
- [ ] 聚合不变性约束是否完整覆盖了业务规则？
- [ ] 必填、唯一、类型、枚举和数据字典约束是否优先使用属性内置字段？
- [ ] 只依赖当前属性值的扩展约束是否放入 refRules？
- [ ] 依赖同一聚合多个属性或子实体的约束是否放入 invariants？

### M2 行为模型评审
- [ ] 每个行为是否真正原子化，只操作一个对象？
- [ ] 前置条件是否完整覆盖了行为可执行的业务前提？
- [ ] 后置状态变更是否完整描述了行为的全部副作用？
- [ ] `syncTriggers` 是否只表达跨聚合联动？同聚合内部变化是否未误用 syncTriggers？
- [ ] `syncTriggers` 中的条件判断是否引用了 M3 规则，而非硬编码在行为里？
- [ ] `queryReportRef` 是否只出现在 behaviorType=QUERY 的行为上，且与 M7 双向一致？
- [ ] `triggerType=USER_ACTION` 的行为是否都能被 MU 操作功能点反向追溯？

### M3 规则模型评审
- [ ] 是否错误包含了可由属性内置字段、refRules 或 invariants 表达的对象内部规则？
- [ ] 每条规则是否至少涉及跨对象、跨行为或独立复用中的一种？
- [ ] 规则表达式是否无副作用（不改变系统状态）？
- [ ] 规则是否仅被行为同步调用，未保留任何事件订阅/触发语义？

### M5 主体模型评审
- [ ] 是否未残留外部实体或外部接口契约定义？
- [ ] ABAC 条件是否覆盖了数据隔离需求（如按部门隔离）？
- [ ] 角色继承关系是否符合最小权限原则？

### M6 流程模型评审
- [ ] 每条流程是否明确标记为 COLLABORATION 或 APPROVAL？
- [ ] 是否有且仅有一个开始活动，并至少有一个结束活动？
- [ ] USER_TASK 和 APPROVAL_TASK 是否只引用已存在的 M5 roleId？
- [ ] 活动 roleRef 是否同时包含在流程 roleRefs 中？
- [ ] 是否未使用事件触发、事件等待或场景调用活动？
- [ ] 协同流调用审批流时是否通过 subFlowRef 引用，而非复制审批活动？
- [ ] 网关是否至少两个分支、最多一个默认分支，且非默认分支存在判断条件？
- [ ] 审批流是否覆盖通过、驳回、退回等真实结果？
- [ ] 子流程调用图是否无循环？

### M7 查询统计与报表模型评审
- [ ] 每个对象是否仅直接引用 M1 对象/字段及唯一 M2 QUERY 行为？
- [ ] 是否未定义权限、角色、规则或流程引用？
- [ ] 是否有且仅有一个主查询来源，且所有来源别名和 Join 引用均有效？
- [ ] 多个一对多来源同时参与聚合时，是否先按关联键预聚合？
- [ ] REPORT 是否定义固定列、分组/合计及导出格式？

### MU UI 模型评审
- [ ] 是否采用"总体界面 → 一级菜单 → 二级菜单 → 屏幕 → 操作功能点"层级？
- [ ] 每个一级菜单是否至少包含一个二级菜单？
- [ ] 每个二级菜单是否关联了屏幕？
- [ ] 每个屏幕是否声明了 elements 与 actions？
- [ ] 控件类型是否遵循映射规则（日期→DATEPICKER、枚举/字典→COMBO、对象引用→POPUP_SELECT）？
- [ ] 布局是否遵循规则（单表 2 列、主从主表 3 列 + 从表表格、查询条件 3 列 + 结果表格分页）？
- [ ] 带审批流的功能是否包含"保存草稿"和"提交"两个独立功能点？
- [ ] 每个操作功能点引用的 M2 行为是否存在且 triggerType 匹配？
- [ ] 是否所有 USER_ACTION 行为都能从某操作功能点反向追溯？

## 10.3  文件存储、导入与版本管理

模型文件统一位于 `yaml/` 目录：

```
yaml/
├── m1-object-model.yaml
├── m2-behavior-model.yaml
├── m3-rule-model.yaml
├── m5-actor-model.yaml
├── m6-flow-model.yaml
├── m7-report-model.yaml
├── mu-ui-model.yaml
└── manifest.json       # 可选，路径必须为相对路径
```

**版本管理约定**：

- 每个元文件内部维护自己的 `version` 字段；
- 跨模型的破坏性变更（如实体删除、行为签名变更）需要在 `CHANGELOG.md` 中记录；
- 规则模型支持独立版本；
- `manifest.json` 为可选文件，缺失时按固定文件名识别。

## 10.4  工具链建议

| 工具场景 | 建议方案 |
|----------|----------|
| 模型编辑 | VS Code + YAML 插件 + 自定义 JSON Schema 校验 |
| 可视化 | 生成聚合 ER 图、流程泳道图、菜单树与 ASCII 布局图 |
| 一致性检查 | 检查行为 ownerEntity、syncTriggers 引用、M2/M7 一对一、M6 流程引用、MU 操作点门禁 |
| 代码生成 | 生成实体骨架、行为方法签名、权限枚举、查询 Service、报表导出骨架、菜单路由与界面骨架 |

---

# 附录  术语对照表

| 术语 | 定义 |
|------|------|
| 本体（Ontology） | 对某个领域中概念及其关系的形式化表达 |
| 聚合（Aggregate） | DDD 中的核心概念，是业务完整性的边界，由聚合根、子实体和值对象组成 |
| 聚合根（Aggregate Root） | 聚合的唯一入口，负责维护聚合内的业务不变性 |
| 子实体（Entity） | 聚合内部有标识的对象，依赖聚合根生命周期 |
| 值对象（Value Object） | 无标识的不可变对象，通过属性值判断相等性 |
| 聚合不变性（Invariant） | 聚合内必须始终满足的业务规则 |
| 原子行为（Atomic Behavior） | 不可再分的最小行为单元，只操作单一对象 |
| 同步联动（SyncTrigger） | 行为成功后同步调用下游行为的跨对象联动声明，条件判断可引用 M3 规则 |
| 端到端协同流（Collaboration Flow） | M6 中跨业务阶段从开始到结束的完整业务流程 |
| 审批流（Approval Flow） | M6 中由角色承担审批任务，并显式描述通过、驳回、退回及条件网关的流程 |
| 人工任务（Human Task） | 由 M5 角色承担的 USER_TASK 或 APPROVAL_TASK |
| 子流程（Sub Flow） | 被另一条 M6 流程通过 subFlowRef 调用的独立流程定义 |
| 查询报表对象（Query Report Object） | M7 中定义跨对象查询、统计分析或固定报表业务语义的对象，与一个 M2 QUERY 行为严格一对一 |
| RBAC | 基于角色的访问控制 |
| ABAC | 基于属性的访问控制，比 RBAC 更细粒度 |
| 数据字典（Data Dictionary） | 对象模型中的引用数据定义，业务数据保存 code、界面显示 label |
| 跳选框（Popup Select） | 对象引用（AggregateRootRef）的界面控件：左边文本框 + 右边按钮弹出对话框选择 |
| 操作功能点（Action Point） | MU 中界面上一个按钮/动作到 M2 行为的对应入口 |
| 悬空引用（Dangling Reference） | 模型中引用了不存在的目标，需通过校验防止 |

---

*© 2026  Ontology-Driven Software Modeling Framework  v9.0（单体同步版 · 七模型）*
