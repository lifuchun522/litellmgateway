# M7 查询统计与报表模型元文件 - m7-report-model.yaml
model_type: REPORT
version: "1.0"
domain: "销售合同执行管理"

query_reports:
  - id: QR-CONTRACT-EXECUTION-001
    name: 合同执行情况分析
    alias: contractExecutionAnalysis
    objectType: STATISTICAL_QUERY
    description: 按合同汇总合同金额、已开票金额、已收款金额、未收款金额和收款完成率
    behaviorRef: Contract_QueryExecutionAnalysis
    sourceObjects:
      - objectRef: AGG-CONTRACT-001
        alias: contract
        primary: true
      - objectRef: AGG-INVOICE-001
        alias: invoiceAgg
        primary: false
        preAggregation:
          groupBy: [contractId]
          columns:
            - name: invoicedAmount
              sourceExpression: invoiceAmount
              aggregateFunction: SUM
      - objectRef: AGG-RECEIPT-001
        alias: receiptAgg
        primary: false
        preAggregation:
          groupBy: [contractId]
          columns:
            - name: receivedAmount
              sourceExpression: receivedAmount
              aggregateFunction: SUM
    joins:
      - joinId: J01
        joinType: LEFT
        leftSource: contract
        rightSource: invoiceAgg
        conditionExpression: "invoiceAgg.contractId == contract.contractId"
      - joinId: J02
        joinType: LEFT
        leftSource: contract
        rightSource: receiptAgg
        conditionExpression: "receiptAgg.contractId == contract.contractId"
    parameters:
      - name: departmentId
        label: 所属部门
        dataType: String
        required: false
        allowedOperators: [EQ]
        sourceField: contract.departmentId
      - name: signDateStart
        label: 签订开始日期
        dataType: Date
        required: false
        allowedOperators: [GE]
        sourceField: contract.signDate
      - name: signDateEnd
        label: 签订结束日期
        dataType: Date
        required: false
        allowedOperators: [LE]
        sourceField: contract.signDate
    conditions:
      - conditionId: C01
        leftExpression: contract.departmentId
        operator: EQ
        parameterRef: departmentId
        logicalConnector: AND
        group: BASE
        skipWhenParameterEmpty: true
      - conditionId: C02
        leftExpression: contract.signDate
        operator: GE
        parameterRef: signDateStart
        logicalConnector: AND
        group: BASE
        skipWhenParameterEmpty: true
      - conditionId: C03
        leftExpression: contract.signDate
        operator: LE
        parameterRef: signDateEnd
        logicalConnector: AND
        group: BASE
        skipWhenParameterEmpty: true
    resultColumns:
      - name: contractNo
        label: 合同编号
        dataType: String
        sourceExpression: contract.contractNo
        aggregateFunction: NONE
      - name: contractName
        label: 合同名称
        dataType: String
        sourceExpression: contract.contractName
        aggregateFunction: NONE
      - name: contractAmount
        label: 合同金额
        dataType: Decimal
        sourceExpression: contract.totalAmount
        aggregateFunction: MAX
        format: "#,##0.00"
      - name: invoicedAmount
        label: 已开票金额
        dataType: Decimal
        sourceExpression: invoiceAgg.invoicedAmount
        aggregateFunction: MAX
        format: "#,##0.00"
      - name: receivedAmount
        label: 已收款金额
        dataType: Decimal
        sourceExpression: receiptAgg.receivedAmount
        aggregateFunction: MAX
        format: "#,##0.00"
      - name: unreceivedAmount
        label: 未收款金额
        dataType: Decimal
        sourceExpression: "MAX(contract.totalAmount) - COALESCE(MAX(receiptAgg.receivedAmount), 0)"
        aggregateFunction: NONE
        format: "#,##0.00"
      - name: receiptRate
        label: 收款完成率
        dataType: Decimal
        sourceExpression: "COALESCE(MAX(receiptAgg.receivedAmount), 0) / NULLIF(MAX(contract.totalAmount), 0)"
        aggregateFunction: NONE
        format: "0.00%"
    groupBy:
      - contract.contractNo
      - contract.contractName
    having: []
    orderBy:
      - expression: contract.signDate
        direction: DESC
    pagination:
      enabled: true
      defaultPageSize: 20
      maxPageSize: 200
    reportOptions: null
    referenceSql: null
    version: "1.0"
```

## 7.6  依赖与一致性约束

1. M7 `sourceObjects.objectRef` 必须引用 M1 已存在的聚合根；字段路径必须可解析到 M1；
2. 每个 M7 对象必须填写唯一 `behaviorRef`，目标必须是 M2 `behaviorType=QUERY` 的行为；
3. M2 `queryReportRef` 与 M7 `behaviorRef` 必须双向一致、严格一对一；
4. M7 不得出现 `ruleRefs`、`requiredPermissions`、`roleRefs`、`flowRefs` 等跨模型字段；
5. 每个查询来源别名必须唯一，且必须有且仅有一个 `primary=true` 的主对象；
6. 两个或更多一对多来源同时参与聚合时，必须通过 `preAggregation` 分别按 Join 键汇总后再关联，禁止以 `SUM(DISTINCT amount)` 代替正确的预聚合；
7. `objectType=REPORT` 必须填写 `reportOptions`；其他类型的 `reportOptions` 应为空；
8. `referenceSql` 可选；若填写，其参数绑定与结果映射必须与语义定义一致。

---

# 第八章  MU UI 模型

## 8.1  设计目标与边界

**设计目标**：MU 是七个模型的**入口层/追溯层**，定义"用户在哪里操作、点哪个功能点、驱动哪个行为"，把界面与业务模型用稳定 ID 连成完整调用链。本版 MU 采用**层级导航结构**，自上而下为：

```text
总体界面（应用入口）
  -> 一级菜单
      -> 二级菜单（强制存在，一级菜单下至少一个二级菜单）
          -> UI 界面（ASCII 布局 + 界面元素）
              -> 操作功能点（对应 M2 行为）
```

**边界（强制）**：

1. **只引用、不重定义**：MU 只通过稳定 ID 引用 M1/M2/M6/M7，不重新定义对象、行为、规则、流程或报表；
2. **不承载视觉设计**：配色、字体、像素级布局、图标资源、皮肤属于设计系统/原型/主题，不在本模型；ASCII 布局只表达区域划分与控件排布；
3. **不替代 M6**：端到端/审批流转归 M6；MU 只声明操作功能点与行为入口的对应关系；
4. **不承载业务校验公式**：输入校验引用 M3 规则或 M1 属性约束；控件级格式（掩码、联动启用）可作为元素属性，仅限本元素内；
5. 纯展示界面允许无操作功能点，但必须存在界面元素。

## 8.2  模型元素规范

### 8.2.1  应用（Application）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| name | String | 系统名称（中文） |
| menus | Menu[] | 一级菜单集合 |

### 8.2.2  菜单（Menu）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| menuId | String | 菜单唯一标识 |
| name | String | 菜单名称 |
| children | Menu[] | 二级菜单集合（**强制至少一个**） |
| screenRef | ScreenRef | 二级菜单关联的屏幕 screenId（一级菜单不直接关联屏幕） |

约束：

1. 菜单层级固定为**两级**：一级菜单 → 二级菜单；
2. 一级菜单必须包含至少一个二级菜单，即使业务上仅有一个子项；
3. 只有二级菜单才关联具体屏幕（`screenRef`），一级菜单仅作分组；
4. 二级菜单与屏幕一对一（一个二级菜单对应一个屏幕）。

### 8.2.3  屏幕（Screen）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| screenId | String | 屏幕唯一标识（建议与实现控件名一致，如 `frmXxx`） |
| name | String | 屏幕业务名称（中文） |
| screenType | Enum | `SINGLE_FORM`（单表维护/单条录入）/ `LIST_MAINTENANCE`（列表维护）/ `MASTER_DETAIL_FORM`（主从表维护）/ `QUERY_LIST`（查询列表） |
| layout | String | ASCII 界面布局图（等宽字符），遵循 §8.4 布局规则 |
| elements | Element[] | 屏幕元素集合 |
| actions | ActionPoint[] | 操作功能点集合 |

### 8.2.4  界面元素（Element）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | String | 元素标识（控件名），屏幕内唯一 |
| type | Enum | 控件类型，见 §8.3 控件类型映射 |
| label | String | 显示文案 |
| io | Enum | I（输入）/ O（输出）/ I_O（输入输出）；空表示纯展示 |
| required | Boolean | 是否必填（与 M1 属性 `required` 对齐） |
| dataBinding | FieldPath | 绑定的 M1 聚合属性路径，如 `Contract.contractName` |
| dataSource | QueryReportRef | 列表/下拉型控件的数据来源（引用 M7 对象） |
| refRules | UIElementRule[] | 可选；控件级规则（掩码、格式、联动启用），仅限本元素内 |

### 8.2.5  操作功能点（ActionPoint）

操作功能点是界面与行为模型的衔接点，对应"界面上的一个按钮/动作 → 调用一个 M2 行为"。

| 属性名 | 类型 | 说明 |
|--------|------|------|
| actionId | String | 功能点唯一标识 |
| name | String | 功能点名称（按钮文案） |
| behaviorRef | BehaviorRef | 对应调用的 M2 行为 |
| actionType | Enum | `BUTTON`（普通按钮）/ `SUBMIT`（提交）/ `DRAFT`（保存草稿）/ `APPROVE`（审批通过）/ `REJECT`（审批驳回）/ `RETURN`（审批退回） |
| permissionRef | PermissionRef[] | 可选；控制功能点可用性的 M5 权限 |

### 8.2.6  控件类型（Element.type）枚举

| type | 说明 |
|------|------|
| TEXTBOX | 文本框 |
| TEXTAREA | 多行文本域（备注类字段） |
| COMBO | 下拉列表框（枚举 / 数据字典） |
| DATEPICKER | 日期控件 |
| POPUP_SELECT | 跳选框（对象引用 AggregateRootRef：左边文本框 + 右边按钮弹出对话框选择） |
| NUMBER | 数字框 |
| CHECKBOX | 复选框 |
| BUTTON | 按钮 |
| GRID | 表格（明细/查询结果） |
| LABEL | 标签 |

## 8.3  控件类型映射规则（强制）

对象模型属性类型到界面控件类型的固定映射：

| M1 属性类型 | 界面控件类型 | 说明 |
|-------------|--------------|------|
| Date / DateTime | DATEPICKER | 日期控件 |
| Enum | COMBO | 下拉列表框，选项来自 `enumValues` |
| DictionaryRef | COMBO | 下拉列表框，选项来自数据字典项（label 显示、code 存储） |
| AggregateRootRef | POPUP_SELECT | 跳选框：左边文本框（显示目标对象名称），右边小按钮弹出对话框选择 |
| String（长文本/备注） | TEXTAREA | 多行文本域 |
| Boolean | CHECKBOX | 复选框 |
| 其他标量（String/Integer/Decimal/Money） | TEXTBOX / NUMBER | 文本框或数字框 |

## 8.4  ASCII 界面布局规则（强制）

**布局总则（强制）**：表单属性标签一律**右对齐**（文字末尾对齐）、控件一律**左对齐**，标签列采用固定宽度，形成规整的「标签列 + 控件列」表格化布局。

ASCII 布局图是屏幕结构化布局的轻量表达，描述"控件位于哪个区域、如何排布"，**不描述视觉样式**。绘制约定：

- 等宽字符绘制，每行建议不超过 100 字符；
- 边框使用 `┌ ─ ┐ └ ┘ │ ├ ┤` 绘制区域边界；
- 控件标注：`[elementId]` 文本框/按钮、`(cboId)` 下拉框、`{dtpId}` 日期、`[pslId…]` 跳选框、`@grdId` 表格；
- 布局中出现的每个 elementId 必须存在于该屏幕 `elements`，且 `io`/`required` 与 `elements` 对齐。

### 8.4.1  单表维护界面（SINGLE_FORM）

- **一行布置两个属性控件**，属性标签右对齐、控件左对齐，左右布局（表格化）；
- 遇到备注等长文本字段，**可一行只布置一个控件**（占满整行）。

> 说明：`SINGLE_FORM` 用于**单条记录的录入/维护**（页面直接展示一个表单，如"收款录入"）。主数据、数据字典、简单实体等需要"列表 + 增删改"的维护界面应使用 `LIST_MAINTENANCE`（列表维护界面，见 §8.4.4），不得用 `SINGLE_FORM` 在页面顶部堆表单 + 底部列表的方式实现。

```
┌──────────────────────────────────────────────────────────────┐
│ 合同维护                                            [btnExit] │
├──────────────────────────────────────────────────────────────┤
│ 合同编号: [txtContractNo]        合同名称: [txtContractName]  │
│ 合同类型: (cboContractType)      签订时间: {dtpSignDate}      │
│ 所属产品: [pslProduct]           所属客户: [pslCustomer]      │
│ 所属部门: [pslDepartment]        责任人:   [pslOwner]         │
│ 合同总金额:[txtTotalAmount]      合同税率: [txtTaxRate]       │
│ 备注: [txtaRemark]                                            │
├──────────────────────────────────────────────────────────────┤
│ [btnSave] [btnSubmit] [btnCancel]                             │
└──────────────────────────────────────────────────────────────┘
```

### 8.4.2  主从表维护界面（MASTER_DETAIL_FORM）

- **主表一行布置三个属性控件**，属性标签右对齐、控件左对齐，左右布局（表格化）；
- **从表在下方**，以表格化布局呈现；从表数据的**新增、维护、删除直接在表格内动态完成**（表格内编辑行、行内删除按钮）。

```
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
```

### 8.4.3  查询列表界面（QUERY_LIST）

- **查询条件放上面**，一行布置三个属性控件，属性标签右对齐、控件左对齐，左右布局（表格化）；
- **查询结果表格放在下面**，表格化布局，**支持分页**。

```
┌──────────────────────────────────────────────────────────────┐
│ 合同信息查询                                              [btnExit] │
├──────────────────────────────────────────────────────────────┤
│ 合同编号:[txtContractNo]  合同名称:[txtContractName]  合同类型:(cboContractType) │
│ 所属部门:[pslDepartment]  签订时间从:{dtpStart}  到:{dtpEnd}     │
│ [btnQuery] [btnReset]                                         │
├──────────────────────────────────────────────────────────────┤
│ @grdResult                                                    │
│  合同编号 | 合同名称 | 合同类型 | 合同金额 | 责任人 | 客户 | 部门 │
│ [分页: 共N条 | 第1/20页 | 上一页 | 下一页]                     │
└──────────────────────────────────────────────────────────────┘
```

### 8.4.4  列表维护界面（LIST_MAINTENANCE）

用于**主数据、数据字典、简单实体**的增删改查维护（如产品、客户、部门、人员维护）。布局规则（强制）：

- **页面上不直接展示表单**：界面只包含工具栏 + 列表表格；
- 工具栏包含「新增」按钮（及可选的关键词查询/「查询」按钮）；
- 列表表格的每一行提供「编辑」「删除」行内操作；
- **新增**点击「新增」按钮后**弹出对话框（Modal）**，在弹窗内填写并保存；
- **修改**点击某行「编辑」后**弹出同一对话框**（预填该行数据），在弹窗内修改并保存；
- 弹窗内的表单为单表布局：一行 2 个属性控件，标签右对齐、控件左对齐；编号等系统自动生成字段在弹窗内只读展示、不占输入；
- 保存成功后关闭弹窗并刷新列表；取消则关闭弹窗。

```
┌──────────────────────────────────────────────────────────────┐
│ 产品信息维护                                          [btnExit] │
├──────────────────────────────────────────────────────────────┤
│ 关键词:[txtKeyword]                          [btnQuery] [btnAdd] │
├──────────────────────────────────────────────────────────────┤
│ @grdList                                                      │
│  编号 | 名称 | 类型 | 状态 | [编辑] [删除]                       │
│ [分页: 共N条 | 上一页 | 下一页]                                 │
└──────────────────────────────────────────────────────────────┘

（点击「新增」/「编辑」弹出对话框，页面本身不展示以下表单）
┌──────────────────────────────┐
│ 新增产品 / 编辑产品            │
│ 编号:[txtNo(只读)]            │
│ 名称:[txtName]   类型:(cboType)│
│              [btnCancel] [btnSave] │
└──────────────────────────────┘
```

## 8.5  审批功能的双按钮规则（强制）

如果一个功能（屏幕）本身带审批流，那么该屏幕在"创建/录入"时**必须提供两个独立的按钮功能点**：

1. **保存草稿**（`actionType=DRAFT`）：仅保存数据，将对象置于"草稿"状态，不触发审批；对应 M2 的 `Contract_SaveAsDraft` 行为；
2. **提交**（`actionType=SUBMIT`）：保存数据并提交进入审批流，对应 M2 的 `Contract_Submit` 行为（该行为将对象置于"待审批"状态，并作为审批流的启动入口）。

约束：

- 两个按钮必须是**独立的功能点**，分别对应独立的 M2 行为，不得合并为一个"保存"按钮；
- 提交行为在 M6 审批流中以 `trigger.behaviorRef` 引用，作为审批流启动入口；
- 无审批流的功能不需要"保存草稿/提交"双按钮，只需"保存"按钮。

## 8.6  YAML 元文件模板

```yaml
