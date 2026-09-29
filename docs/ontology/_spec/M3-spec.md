# M3 规则模型元文件 - m3-rule-model.yaml
model_type: RULE
version: "2.0"
domain: "销售合同执行管理"

rules:
  - id: RULE-CONTRACT-CLOSE-CHECK
    name: 合同关闭资格校验
    ruleType: VALIDATION
    description: 判断合同累计收款金额是否已达到合同总金额，达到则可关闭
    inputParams:
      - name: contractId
        type: String
        sourceField: Contract.contractId
        required: true
      - name: totalAmount
        type: Decimal
        sourceField: Contract.totalAmount
        required: true
      - name: receivedAmount
        type: Decimal
        sourceField: Receipt.aggregatedAmount
        required: true
    outputType: Boolean
    expression: |
      receivedAmount >= totalAmount
    reusedBy:
      - Receipt_Record          # 通过 syncTriggers 引用
    version: "1.0"

  - id: RULE-INVOICE-AMOUNT-CHECK
    name: 阶段开票金额上限校验
    ruleType: VALIDATION
    description: 校验某付款阶段累计开票金额不超过该阶段应开票金额
    inputParams:
      - name: stageAmount
        type: Decimal
        sourceField: PaymentStage.amount
        required: true
      - name: invoicedAmount
        type: Decimal
        sourceField: Invoice.aggregatedAmount
        required: true
    outputType: Boolean
    expression: |
      invoicedAmount <= stageAmount
    reusedBy:
      - Invoice_Issue
    version: "1.0"
```

## 4.5  最佳实践

- **单一职责**：一个规则只判断一个业务条件；
- **明确输入输出**：清晰定义输入参数和输出结果；
- **无副作用**：规则只判断/计算，不改变任何对象状态；
- **规则失败不阻断其他处理**：规则校验失败应返回明确业务提示，由调用方（行为）决定后续处理；
- **版本管理**：规则升级时保持输入输出接口兼容，支持独立版本管理与回滚。

---

# 第五章  M5 主体模型

## 5.1  设计目标

主体模型解决"谁能做什么"的问题，采用 RBAC（基于角色的访问控制）为基础，支持 ABAC（基于属性的访问控制）扩展。

> **设计决策**：权限定义不内嵌于行为模型，而是在行为模型中声明 `requiredPermissions`，在主体模型中定义权限的授予关系。这样角色权限的变化不影响行为模型定义。

> **v9.0 裁剪**：移除外部实体（ExternalEntity）与外部接口契约（externalContract），本系统不涉及外部系统交互，主体模型仅定义内部参与者、角色与权限。

## 5.2  模型层次

| 层次 | 说明 |
|------|------|
| 参与者（Actor） | 与系统交互的主体，分为：人类用户（Human）、系统账户（System） |
| 角色（Role） | 权限的集合单元，一个参与者可拥有多个角色，角色支持继承 |
| 权限（Permission） | 对特定对象或行为的操作授权，粒度到行为级别 |
| 权限组（PermissionGroup） | 权限的分组管理，便于批量授予 |

## 5.3  模型元素规范

### 5.3.1  参与者（Actor）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| actorId | String | 主体唯一标识 |
| actorType | Enum | HUMAN / SYSTEM |
| roles | RoleRef[] | 拥有的角色列表 |
| attributes | Map | 主体属性（用于 ABAC 条件评估，如 department, level） |

### 5.3.2  角色（Role）

角色除了承载权限集合，也是 M6 人工任务的唯一参与人类型。删除或重命名角色前，必须分析所有 M6 流程中的 `roleRefs` 和活动 `roleRef`。

| 属性名 | 类型 | 说明 |
|--------|------|------|
| roleId | String | 角色唯一标识 |
| name | String | 角色名称 |
| inheritsFrom | RoleRef[] | 继承的父角色（支持多继承） |
| permissions | PermissionRef[] | 直接授予的权限列表 |
| permissionGroups | GroupRef[] | 授予的权限组 |

### 5.3.3  权限（Permission）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| permissionId | String | 权限标识，建议格式：PERM-{Domain}-{Action} |
| targetType | Enum | 授权目标类型：BEHAVIOR（行为）/ ENTITY（实体数据） |
| targetRef | Ref | 授权目标引用 |
| dataScope | Enum | 数据范围：ALL / OWN / DEPT / CUSTOM |
| abacCondition | String | ABAC 条件表达式，如 `actor.dept == resource.dept` |

## 5.4  YAML 元文件模板

```yaml
