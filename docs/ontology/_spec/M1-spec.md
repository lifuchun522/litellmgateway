# M1 对象模型元文件 - m1-object-model.yaml
model_type: OBJECT
version: "2.1"
domain: "销售合同执行管理"

aggregates:
  - id: AGG-CONTRACT-001
    name: 合同
    alias: Contract
    aggregateType: AGGREGATE_ROOT
    description: 对外销售产生的合同签订信息，包含合同基本信息和付款条款明细
    lifecycle: [草稿, 待审批, 已生效, 已关闭, 已作废]
    tags: [核心域]

    attributes:
      - name: contractNo
        label: 合同编号
        type: String
        required: true
        unique: true
      - name: contractName
        label: 合同名称
        type: String
        required: true
        refRules:
          - name: 合同名称长度限制
            description: 合同名称最多 100 个字符
            expression: "LENGTH(value) <= 100"
            violationMessage: 合同名称不能超过 100 个字符
            enforcedAt: ALWAYS
      - name: contractType
        label: 合同类型
        type: DictionaryRef
        dictionaryRef:
          dictionaryId: DICT-CONTRACT-BASE
          typeCode: CONTRACT_TYPE
        required: true
      - name: productId
        label: 所属产品
        type: AggregateRootRef
        targetAggregate: AGG-PRODUCT-001
        required: true
      - name: customerId
        label: 所属客户
        type: AggregateRootRef
        targetAggregate: AGG-CUSTOMER-001
        required: true
      - name: departmentId
        label: 所属部门
        type: AggregateRootRef
        targetAggregate: AGG-DEPARTMENT-001
        required: true
      - name: ownerId
        label: 责任人
        type: AggregateRootRef
        targetAggregate: AGG-EMPLOYEE-001
        required: true
      - name: signDate
        label: 签订时间
        type: Date
        required: true
      - name: totalAmount
        label: 合同总金额（含税）
        type: Money
        required: true
        refRules:
          - name: 合同总金额必须为正数
            description: 合同总金额必须大于 0
            expression: "value > 0"
            violationMessage: 合同总金额必须大于 0
            enforcedAt: ALWAYS
      - name: purchaseAmount
        label: 对外采购金额
        type: Money
      - name: taxRate
        label: 合同税率
        type: Decimal
        required: true
        refRules:
          - name: 税率合法范围
            description: 税率取值在 0 到 1 之间
            expression: "value >= 0 AND value <= 1"
            violationMessage: 税率取值应在 0 到 1 之间
            enforcedAt: ALWAYS
      - name: status
        label: 合同状态
        type: Enum
        enumValues: [草稿, 待审批, 已生效, 已关闭, 已作废]
        required: true

    entities:
      - name: 付款条款
        alias: PaymentStage
        description: 合同付款阶段明细
        localId: stageId
        cardinality: ONE_OR_MORE
        cascadeDelete: true
        attributes:
          - name: stageId
            label: 付款阶段编号
            type: Integer
            required: true
          - name: stageName
            label: 付款阶段名称
            type: String
            required: true
          - name: payRatio
            label: 付款比例
            type: Decimal
            required: true
            refRules:
              - name: 付款比例合法范围
                description: 付款比例在 0 到 100 之间
                expression: "value > 0 AND value <= 100"
                violationMessage: 付款比例应在 0 到 100 之间
                enforcedAt: ALWAYS

    invariants:
      - name: 付款比例合计等于 100
        expression: "SUM(stages.payRatio) == 100"
        violationMessage: 付款阶段付款比例合计必须等于 100
        enforcedAt: ON_CREATE

  # 其余聚合（产品、客户、部门、人员、开票明细、收款）略，结构同上
  - id: AGG-INVOICE-001
    name: 开票明细
    alias: Invoice
    aggregateType: AGGREGATE_ROOT
    description: 基于付款阶段对客户开票形成的开票明细
    lifecycle: [未收款, 部分收款, 已收款, 已作废]
    attributes:
      - name: invoiceNo
        label: 开票编号
        type: String
        required: true
        unique: true
      - name: contractId
        label: 对应合同
        type: AggregateRootRef
        targetAggregate: AGG-CONTRACT-001
        required: true
      - name: invoiceAmount
        label: 开票金额
        type: Money
        required: true
      - name: invoiceTaxRate
        label: 开票税率
        type: Decimal
        required: true
      - name: invoiceDate
        label: 开票时间
        type: Date
        required: true
      - name: receivedFlag
        label: 是否收款
        type: Boolean
        required: true
        defaultValue: false
      - name: receivedDate
        label: 收款时间
        type: Date

# 数据字典
data_dictionaries:
  - id: DICT-CONTRACT-BASE
    name: 合同基础数据字典
    types:
      - typeCode: CONTRACT_TYPE
        typeName: 合同类型
        items:
          - code: PRODUCT
            label: 产品合同
            enabled: true
            sortOrder: 10
          - code: SERVICE
            label: 服务合同
            enabled: true
            sortOrder: 20
          - code: INTEGRATION
            label: 集成合同
            enabled: true
            sortOrder: 30

# 聚合间关联
aggregate_associations:
  - id: ASSOC-CONTRACT-INVOICE
    sourceAggregate: AGG-CONTRACT-001
    targetAggregate: AGG-INVOICE-001
    associationType: REFERENCE
    sourceRole: 产生开票
    targetRole: 所属合同
    cardinality: ONE_TO_MANY
    referenceField: contractId
```

## 2.5  聚合建模最佳实践

### 2.5.1  聚合大小控制

- **小聚合优先**：聚合越小，并发冲突越少，性能越好；
- **业务完整性优先**：不能为了性能牺牲业务完整性；
- **经验法则**：一个聚合包含的子实体不超过 3-5 个，总字段数不超过 30 个。

### 2.5.2  聚合拆分时机

| 拆分信号 | 处理方式 |
|----------|----------|
| 子实体有独立生命周期 | 提升为独立聚合根，通过 ID 引用 |
| 子实体被多个聚合引用 | 提升为独立聚合根 |
| 聚合内部分字段很少一起修改 | 拆分为多个聚合，通过同步联动保持一致性 |

### 2.5.3  数据冗余策略

为避免跨聚合查询，可在聚合内冗余其他聚合的关键展示信息（如名称、编码），通过同步联动保持最终一致。只冗余展示用的稳定字段，不冗余频繁变化的字段。

### 2.5.4  聚合根 ID 设计

| ID 类型 | 适用场景 | 示例 |
|---------|----------|------|
| UUID | 分布式系统，客户端生成 ID | `550e8400-...` |
| 业务编号 | 有业务规则的编号体系 | `HT-2026-08-0001` |
| 自增 ID | 单库自增主键 | `10001` |

---

# 第三章  M2 行为模型

## 3.1  设计目标

行为模型定义对象能够执行的原子行为方法。每个行为是单一对象发出的、不可再分的核心操作单元。复杂判断通过规则模型注入；跨对象联动通过 `syncTriggers` 同步调用下游行为；端到端和审批流转通过 M6 流程编排。

> **关键设计原则**：行为模型的核心约束是"原子性"——每个行为方法只做一件事，操作一个对象，产生确定性的状态变更。跨对象的联动关系必须通过 `syncTriggers` 显式声明，不得在行为方法内部隐含地直接操作其他聚合。

## 3.2  模型元素规范

### 3.2.1  行为（Behavior）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | String | 行为唯一标识，建议格式：{EntityAlias}_{ActionName} |
| name | String | 行为业务名称（中文动宾短语） |
| ownerEntity | EntityRef | 行为所属对象 |
| behaviorType | Enum | COMMAND（指令，改变状态）/ QUERY（查询，只读） |
| triggerType | Enum | USER_ACTION（用户触发）/ SYSTEM（系统自动） |
| preconditions | Condition[] | 前置条件集合，全部满足才可执行 |
| postconditions | StateChange[] | 执行后的状态变更描述 |
| appliedRules | RuleRef[] | 调用的规则模型引用 |
| requiredPermissions | PermissionRef[] | 执行所需权限（引用 M5 主体模型） |
| syncTriggers | SyncTrigger[] | 执行成功后同步调用的下游行为（跨对象联动） |
| queryReportRef | QueryReportRef | 当 behaviorType=QUERY 且行为执行 M7 查询统计或报表对象时填写；与 M7.behaviorRef 严格一对一 |

### 3.2.2  同步联动（SyncTrigger）

`syncTriggers` 是 v9.0 替代原事件模型的跨对象联动载体。行为执行成功后，按顺序同步执行 `syncTriggers` 中声明的联动：

| 属性名 | 类型 | 说明 |
|--------|------|------|
| ruleRef | RuleRef | 可选；条件判断规则引用。填写时表示"规则满足才触发下游行为" |
| behaviorRef | BehaviorRef | 必填；满足条件（或无额外条件）时同步调用的下游行为 |
| description | String | 联动业务说明 |

约束：

1. `ruleRef` 省略表示无条件联动，下游行为直接同步调用；
2. `ruleRef` 填写时必须引用 M3 规则，规则只判断条件，不修改状态；
3. 同一行为可声明多条 `syncTriggers`，按声明顺序执行；
4. 下游行为必须作用于另一个独立聚合（跨对象），同一聚合内部变化不得用 `syncTriggers` 表达；
5. 联动失败（规则不满足或下游行为异常）的语义必须在行为的 `postconditions` 或 M6 流程中明确，禁止隐含吞掉异常。

### 3.2.3  前置/后置条件（Condition / StateChange）

使用简洁的谓词表达式语法：

- 前置条件示例：`contract.status == '待审批'  AND  contract.totalAmount > 0`
- 状态变更示例：`contract.status = '已生效'  |  contract.activateAt = NOW()`
- 支持跨实体引用：`invoice.receivedAmount <= invoice.invoiceAmount`

## 3.3  YAML 元文件模板

```yaml
