# M2 行为模型元文件 - m2-behavior-model.yaml
model_type: BEHAVIOR
version: "1.0"
domain: "销售合同执行管理"

behaviors:
  # ══════════════════════════════════════════════════════════
  # 命令行为 + 跨对象联动（收款完成后自动判断关闭合同）
  # ══════════════════════════════════════════════════════════
  - id: Receipt_Record
    name: 录入收款
    ownerEntity: AGG-RECEIPT-001
    behaviorType: COMMAND
    triggerType: USER_ACTION
    preconditions:
      - "收款信息合法"
      - "关联的开票记录存在"
    postconditions:
      - field: receipt.status
        setValue: "已收款"
    appliedRules:
      - RULE-RECEIPT-AMOUNT-CHECK
    requiredPermissions:
      - PERM-RECEIPT-RECORD
    syncTriggers:
      - ruleRef: RULE-CONTRACT-CLOSE-CHECK
        behaviorRef: Contract_Close
        description: 收款录入后检查合同是否全部收齐，满足则同步关闭合同

  # ══════════════════════════════════════════════════════════
  # 无审批功能的保存行为（无 syncTriggers）
  # ══════════════════════════════════════════════════════════
  - id: Contract_SaveAsDraft
    name: 保存合同草稿
    ownerEntity: AGG-CONTRACT-001
    behaviorType: COMMAND
    triggerType: USER_ACTION
    preconditions:
      - "合同基本信息完整"
    postconditions:
      - field: contract.status
        setValue: "草稿"
    appliedRules: []
    requiredPermissions:
      - PERM-CONTRACT-CREATE
    syncTriggers: []

  - id: Contract_Submit
    name: 提交合同审批
    ownerEntity: AGG-CONTRACT-001
    behaviorType: COMMAND
    triggerType: USER_ACTION
    preconditions:
      - "contract.status == '草稿'"
    postconditions:
      - field: contract.status
        setValue: "待审批"
    appliedRules: []
    requiredPermissions:
      - PERM-CONTRACT-CREATE
    syncTriggers: []

  # ══════════════════════════════════════════════════════════
  # 查询行为（与 M7 一对一绑定）
  # ══════════════════════════════════════════════════════════
  - id: Contract_QueryExecutionAnalysis
    name: 查询合同执行情况分析
    ownerEntity: AGG-CONTRACT-001
    behaviorType: QUERY
    triggerType: USER_ACTION
    preconditions: []
    postconditions: []
    appliedRules: []
    requiredPermissions:
      - PERM-CONTRACT-ANALYSIS
    syncTriggers: []
    queryReportRef: QR-CONTRACT-EXECUTION-001
```

> **说明**：`syncTriggers` 字段替代历史版本的 `producedEvents`。普通单聚合命令行为可不填写（空数组）；查询行为不产生状态变化，`syncTriggers` 必须为空。

## 3.4  一致性约束

1. `triggerType=USER_ACTION` 的行为必须被至少一个 MU 操作功能点引用（可追溯性门禁，防止孤儿行为）；
2. `syncTriggers` 中引用的 `behaviorRef`、`ruleRef` 必须分别存在于 M2、M3；
3. `syncTriggers` 的下游行为必须操作另一个独立聚合（跨对象），禁止同聚合内自我联动；
4. 行为 `postconditions` 描述的状态变更，应与 MU 操作功能点的回显/刷新行为衔接（如保存成功后刷新列表）；
5. `queryReportRef` 只出现在 `behaviorType=QUERY` 的行为上，并与 M7 `behaviorRef` 双向一致、严格一对一。

---

# 第四章  M3 规则模型

## 4.1  设计目标与边界

规则模型专注于跨对象、跨行为或需要独立复用的解耦业务规则，是从对象局部约束和行为逻辑中分离出来的独立关切。其核心价值在于：同一规则可以被多个行为引用，规则变更不影响对象结构和行为定义。

> **重要边界说明**：能够在单个属性内部定义清楚的规则不进入 M3。必填、唯一、类型、枚举和数据字典约束直接使用 M1 属性字段；只依赖当前属性值的扩展表达式使用属性 `refRules`；依赖同一对象多个属性或聚合内部子实体的规则使用聚合 `invariants`。M3 只处理超出单个对象内部边界的业务判断、计算、推导，并且**一律由行为同步调用**。

### 4.1.1  M1 局部规则与 M3 规则的判定

| 规则特征 | 归属位置 | 示例 |
|----------|----------|------|
| 属性内置约束 | M1 Attribute 字段 | 必填、唯一、枚举、字典引用 |
| 只读取当前属性值 | M1 Attribute.refRules | 金额大于 0、名称长度不超过 100 |
| 读取同一对象多个属性或聚合内部子实体 | M1 Aggregate.invariants | 付款比例合计等于 100% |
| 读取两个或多个独立对象 | M3 Rule | 累计收款金额达到合同总金额 |
| 依赖行为执行结果或被多个行为复用 | M3 Rule | 合同关闭资格校验、阶段开票上限校验 |
| 调用外部规则引擎或外部数据决策 | M3 Rule | 信用风险评分、合规名单校验 |

判断顺序：

```text
内置字段能表达？
-> 是：使用属性内置字段
-> 否：是否只依赖当前属性值？
   -> 是：使用 Attribute.refRules
   -> 否：是否只依赖同一聚合内部数据？
      -> 是：使用 Aggregate.invariants
      -> 否：进入 M3 规则模型（被行为同步调用）
```

## 4.2  规则分类体系

| 规则类型 | 说明 | 触发方式 |
|----------|------|----------|
| 验证规则（Validation Rule） | 对跨属性、跨对象或行为上下文执行验证，返回 true/false，不改变状态 | 被行为调用 |
| 计算规则（Calculation Rule） | 根据输入参数计算并返回结果值 | 被行为调用 |
| 推导规则（Derivation Rule） | 基于已知属性推导出其他属性值 | 被行为调用 |
| 转换规则（Transformation Rule） | 将一种数据格式转换为另一种 | 被行为调用 |
| 风控规则（Risk Rule） | 评估业务风险，返回风险等级或通过/拒绝决策 | 被行为调用 |

> v9.0 移除"事件驱动规则（EVENT_DRIVEN）"。所有规则均是被行为（或经 `syncTriggers`）同步调用的被动组件，不主动订阅任何事件，也不直接触发行为。规则只负责判断与计算，对象状态变化始终由行为完成。

## 4.3  模型元素规范

### 4.3.1  通用规则属性

| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | String | 规则唯一标识，建议格式：RULE-{Domain}-{Seq} |
| name | String | 规则业务名称 |
| ruleType | Enum | VALIDATION / CALCULATION / DERIVATION / TRANSFORMATION / RISK |
| description | String | 规则的业务逻辑说明 |
| inputParams | Param[] | 输入参数定义（名称、类型、来源字段） |
| outputType | DataType | 返回值类型，通常为 Boolean 或结构化结果 |
| expression | String | 规则表达式（支持伪代码或 DSL，不限定具体语言） |
| reusedBy | BehaviorRef[] | 引用本规则的行为列表（反向追踪） |
| externalEngine | String | 若委托外部规则引擎，填写引擎名称（可选） |
| version | String | 规则版本，支持规则的独立版本管理 |

### 4.3.2  输入参数（Param）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| name | String | 参数名称 |
| type | DataType | 参数类型 |
| sourceField | String | 来源字段路径，如 "contract.totalAmount" |
| required | Boolean | 是否必填 |
| description | String | 参数说明 |

## 4.4  YAML 元文件模板

```yaml
