# M6 流程模型元文件 - m6-flow-model.yaml
model_type: FLOW
version: "1.0"
domain: "销售合同执行管理"

flows:
  - id: FLOW-CONTRACT-001
    name: 合同全生命周期协同流
    flowType: COLLABORATION
    description: 从合同创建、审批、生效、开票和收款到合同关闭的端到端协同流程
    businessObjectRefs:
      - AGG-CONTRACT-001
      - AGG-INVOICE-001
      - AGG-RECEIPT-001
    roleRefs:
      - ROLE-SALES
      - ROLE-FINANCE
      - ROLE-FINANCE-MANAGER
      - ROLE-GENERAL-MANAGER
    trigger:
      triggerType: MANUAL
    preconditions:
      - "用户具备合同创建权限"
    postconditions:
      - "合同已关闭或流程已明确终止"
    startActivity: A01
    endActivities: [A08]
    activities:
      - activityId: A01
        name: 开始
        activityType: START
        nextActivities: [A02]
      - activityId: A02
        name: 创建合同（保存草稿/提交）
        activityType: USER_TASK
        roleRef: ROLE-SALES
        behaviorRef: Contract_Submit
        nextActivities: [A03]
      - activityId: A03
        name: 合同审批
        activityType: SUB_FLOW_CALL
        subFlowRef: FLOW-CONTRACT-APPROVAL-001
        nextActivities: [A04]
      - activityId: A04
        name: 合同生效
        activityType: BEHAVIOR_CALL
        behaviorRef: Contract_Activate
        nextActivities: [A05]
      - activityId: A05
        name: 合同开票
        activityType: BEHAVIOR_CALL
        behaviorRef: Invoice_Issue
        nextActivities: [A06]
      - activityId: A06
        name: 合同收款
        activityType: BEHAVIOR_CALL
        behaviorRef: Receipt_Record
        nextActivities: [A07]
      - activityId: A07
        name: 合同关闭（由收款行为 syncTriggers 自动触发）
        activityType: SYSTEM_TASK
        behaviorRef: Contract_Close
        nextActivities: [A08]
      - activityId: A08
        name: 结束
        activityType: END
        nextActivities: []

  - id: FLOW-CONTRACT-APPROVAL-001
    name: 合同创建审批流
    flowType: APPROVAL
    description: 合同先由财务经理审批，金额超过 100 万元时增加总经理审批
    businessObjectRefs:
      - AGG-CONTRACT-001
    roleRefs:
      - ROLE-FINANCE-MANAGER
      - ROLE-GENERAL-MANAGER
    trigger:
      triggerType: BEHAVIOR
      behaviorRef: Contract_Submit
    preconditions:
      - "contract.status == '待审批'"
    postconditions:
      - "合同审批通过、驳回或退回修改"
    startActivity: P01
    endActivities: [P06, P07]
    activities:
      - activityId: P01
        name: 开始
        activityType: START
        nextActivities: [P02]
      - activityId: P02
        name: 财务经理审批
        activityType: APPROVAL_TASK
        roleRef: ROLE-FINANCE-MANAGER
        behaviorRef: Contract_ApproveFinance
        approvalOutcomes: [APPROVE, REJECT, RETURN]
        nextActivities: [P03]
      - activityId: P03
        name: 财务审批结果判断
        activityType: GATEWAY
        branches:
          - branchName: 驳回或退回
            conditionExpression: "approval.outcome IN ['REJECT', 'RETURN']"
            targetActivity: P07
            isDefault: false
          - branchName: 财务审批通过
            conditionExpression: "approval.outcome == 'APPROVE'"
            targetActivity: P04
            isDefault: true
      - activityId: P04
        name: 大额合同判断
        activityType: GATEWAY
        branches:
          - branchName: 超过 100 万元
            conditionExpression: "contract.totalAmount >= 1000000"
            targetActivity: P05
            isDefault: false
          - branchName: 普通金额合同
            conditionExpression: null
            targetActivity: P06
            isDefault: true
      - activityId: P05
        name: 总经理审批
        activityType: APPROVAL_TASK
        roleRef: ROLE-GENERAL-MANAGER
        behaviorRef: Contract_ApproveGeneralManager
        approvalOutcomes: [APPROVE, REJECT, RETURN]
        nextActivities: [P06]
      - activityId: P06
        name: 审批通过结束
        activityType: END
        nextActivities: []
      - activityId: P07
        name: 驳回或退回结束
        activityType: END
        nextActivities: []
```

## 6.5  流程约束

1. 每条流程必须有且仅有一个 `startActivity`，并至少有一个 `endActivities`；
2. 除 `END` 外的可达活动必须存在合法后继路径；所有 `endActivities` 必须指向 `END` 活动；
3. `USER_TASK`、`APPROVAL_TASK` 必须填写有效 `roleRef`，且该角色必须包含在流程 `roleRefs` 中；
4. `GATEWAY` 至少有两个分支，最多一个默认分支；非默认分支必须提供 `ruleRef` 或 `conditionExpression` 或 `approvalOutcome`；
5. `SUB_FLOW_CALL` 不得形成直接或间接递归调用环；
6. 审批活动的处理结果必须显式覆盖通过、驳回、退回等实际业务结果，不得只有成功路径；
7. 流程局部条件可使用表达式；跨流程复用、跨对象或复杂决策应定义为 M3 规则并通过 `ruleRef` 引用；
8. 跨对象联动已由 M2 `syncTriggers` 承载，流程中可用 `SYSTEM_TASK` 标注联动触发的结果活动，但不得重复定义联动逻辑。

## 6.6  跨模型引用矩阵

| M6 字段 | 引用目标 | 一致性要求 |
|--------|----------|------------|
| `businessObjectRefs` | M1 `aggregates.id` | 引用对象必须存在 |
| `roleRefs`、`activity.roleRef` | M5 `roles.roleId` | 只允许角色，活动角色必须属于流程 roleRefs |
| `trigger.behaviorRef`、`activity.behaviorRef` | M2 `behaviors.id` | 引用行为必须存在 |
| `activity.ruleRef`、`branch.ruleRef` | M3 `rules.id` | 规则必须无副作用，流程只消费判断结果 |
| `activity.subFlowRef` | M6 `flows.id` | 子流程必须存在，且整个调用图无环 |

---

# 第七章  M7 查询统计与报表模型

## 7.1  设计目标与边界

M7 定义业务应用中的查询统计对象和固定报表对象，专门承载多个 M1 业务对象之间的关联查询、条件过滤、结果列、分组聚合、排序、分页和可选参考 SQL。

M7 不是 BI 指标模型，不定义事实表、维度表、宽表、数据集市、OLAP Cube、ETL 任务或自助分析语义。M7 也不定义独立指标资产；`COUNT`、`SUM`、`AVG`、`MIN`、`MAX` 等只作为具体查询对象内部的聚合表达式存在。

M7 的直接依赖严格限制为：

```text
M7 查询统计或报表对象 -> M1 对象及字段
M7 查询统计或报表对象 <-> M2 QUERY 行为（一对一）
```

M7 不直接引用 M3 规则、M5 主体或 M6 流程。查询条件、关联条件、聚合公式属于查询对象自身定义，不视为 M3 业务规则。数据访问权限暂不在 M7 建模，仍由 M2 行为通过 `requiredPermissions` 与 M5 建立关系。

> **v9.0 裁剪**：参考 SQL 改为可选。因移除 MM 映射模型，物理表名在实现阶段确定，M7 的语义定义（来源/条件/结果列/聚合）才是稳定业务语义，参考 SQL 仅作实现指导。

## 7.2  M2 查询行为与 M7 对象的分界

| 判断问题 | M2 QUERY 行为 | M7 查询统计与报表对象 |
|----------|--------------|-----------------------|
| 核心职责 | 定义"执行一次查询或生成报表"的原子行为 | 定义"查什么、如何关联、如何统计、返回什么" |
| 单聚合简单查询 | 可独立定义，不要求 M7 | 通常不建立 |
| 跨对象关联查询 | 通过 queryReportRef 调用 M7 | 定义来源对象、Join、条件和结果列 |
| 分组统计 | 负责执行入口 | 定义聚合、GROUP BY、HAVING |
| 固定报表 | 负责生成或导出行为 | 定义报表列、分组、小计、合计和导出格式 |
| 权限 | 通过 requiredPermissions 关联 M5 | 不定义权限或角色 |

一条 M2 行为最多引用一个 M7 对象，一个 M7 对象也必须且只能绑定一条 M2 行为。

## 7.3  对象类型

| objectType | 说明 | 典型示例 |
|------------|------|----------|
| `DETAIL_QUERY` | 跨对象详情查询，返回一条主要业务记录及关联信息 | 合同执行详情 |
| `LIST_QUERY` | 跨对象条件列表查询，通常支持分页和排序 | 已开票未收款合同列表 |
| `STATISTICAL_QUERY` | 包含聚合或分组统计的查询分析 | 按部门统计合同金额 |
| `REPORT` | 具有固定列、分组、小计、合计和导出要求的业务报表 | 部门合同执行汇总报表 |

## 7.4  模型元素规范

### 7.4.1  查询统计或报表对象（QueryReportObject）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | String | 对象唯一标识；查询建议 `QR-{DOMAIN}-{NNN}`，报表建议 `RPT-{DOMAIN}-{NNN}` |
| name | String | 查询统计或报表名称 |
| alias | String | 稳定英文别名，使用 lowerCamelCase |
| objectType | Enum | `DETAIL_QUERY` / `LIST_QUERY` / `STATISTICAL_QUERY` / `REPORT` |
| description | String | 业务目的和结果口径说明 |
| behaviorRef | BehaviorRef | 唯一绑定的 M2 QUERY 行为 |
| sourceObjects | QuerySource[] | 查询涉及的 M1 对象及别名 |
| joins | QueryJoin[] | 多对象关联定义 |
| parameters | QueryParameter[] | 查询输入参数和允许操作符 |
| conditions | QueryCondition[] | WHERE 条件语义定义 |
| resultColumns | ResultColumn[] | 查询结果列及聚合表达式 |
| groupBy | FieldExpression[] | 分组字段表达式 |
| having | QueryCondition[] | 聚合后的过滤条件 |
| orderBy | OrderBy[] | 默认排序 |
| pagination | Pagination | 分页约束 |
| reportOptions | ReportOptions | objectType=REPORT 时的固定报表设置 |
| referenceSql | ReferenceSql | 可选；参考 SQL、方言、参数绑定及结果映射 |
| version | String | 对象定义版本 |

### 7.4.2  查询来源（QuerySource）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| objectRef | AggregateRef | M1 聚合根 ID |
| alias | String | 查询内部唯一别名 |
| entityPath | FieldPath | 可选，查询聚合内某个子实体时填写 |
| primary | Boolean | 是否为主查询对象；每个 M7 对象必须且只能有一个主对象 |
| preAggregation | SourcePreAggregation | 可选；在参与 Join 前按关联键预聚合一对多明细，避免多个明细来源相乘 |

### 7.4.3  对象关联（QueryJoin）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| joinId | String | 查询对象内唯一关联标识 |
| joinType | Enum | `INNER` / `LEFT` / `RIGHT` / `FULL` |
| leftSource | SourceAlias | 左侧来源别名 |
| rightSource | SourceAlias | 右侧来源别名 |
| relationRef | AssociationRef | 可选，引用 M1 `aggregate_associations.id` |
| conditionExpression | String | 关联字段表达式 |

### 7.4.4  查询参数（QueryParameter）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| name | String | 参数名 |
| label | String | 参数显示名称 |
| dataType | String | String / Integer / Decimal / Boolean / Date / DateTime / Enum / DictionaryRef |
| required | Boolean | 是否必填 |
| defaultValue | Any | 默认值或表达式 |
| allowedOperators | Enum[] | `EQ` / `NE` / `GT` / `GE` / `LT` / `LE` / `IN` / `NOT_IN` / `LIKE` / `BETWEEN` |
| sourceField | FieldPath | 参数通常约束的 M1 字段路径，可选 |

### 7.4.5  结果列（ResultColumn）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| name | String | 稳定结果字段名 |
| label | String | 业务显示名称 |
| dataType | String | 结果数据类型 |
| sourceExpression | String | M1 字段路径、计算表达式或聚合表达式 |
| aggregateFunction | Enum | `NONE` / `COUNT` / `COUNT_DISTINCT` / `SUM` / `AVG` / `MIN` / `MAX` |
| format | String | 日期、金额、百分比等格式 |
| nullable | Boolean | 是否允许空值 |
| visible | Boolean | 默认是否输出 |
| sortable | Boolean | 是否允许排序 |

### 7.4.6  固定报表设置（ReportOptions）

仅当 `objectType=REPORT` 时使用：

| 属性名 | 类型 | 说明 |
|--------|------|------|
| title | String | 报表标题 |
| layout | Enum | 当前仅支持 `TABLE` |
| groupFields | ResultColumnRef[] | 报表分组列 |
| subtotalFields | ResultColumnRef[] | 分组小计列 |
| totalFields | ResultColumnRef[] | 全表合计列 |
| exportFormats | Enum[] | `XLSX` / `CSV` / `PDF` |
| emptyValueDisplay | String | 空值显示文本 |

## 7.5  YAML 元文件模板（合同执行情况分析）

```yaml
