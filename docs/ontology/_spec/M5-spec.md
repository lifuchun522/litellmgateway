# M5 主体模型元文件 - m5-actor-model.yaml
model_type: ACTOR
version: "1.0"
domain: "销售合同执行管理"

actors:
  - actorId: ACTOR-SALES
    name: 销售人员
    actorType: HUMAN
    roles:
      - ROLE-SALES
  - actorId: ACTOR-FINANCE
    name: 财务人员
    actorType: HUMAN
    roles:
      - ROLE-FINANCE
  - actorId: ACTOR-FINANCE-MANAGER
    name: 财务经理
    actorType: HUMAN
    roles:
      - ROLE-FINANCE-MANAGER
  - actorId: ACTOR-GENERAL-MANAGER
    name: 总经理
    actorType: HUMAN
    roles:
      - ROLE-GENERAL-MANAGER
  - actorId: ACTOR-EMPLOYEE
    name: 普通员工
    actorType: HUMAN
    roles:
      - ROLE-EMPLOYEE

roles:
  - roleId: ROLE-SALES
    name: 销售人员
    permissions:
      - PERM-CONTRACT-CREATE
      - PERM-CONTRACT-QUERY-ALL
  - roleId: ROLE-FINANCE
    name: 财务人员
    permissions:
      - PERM-CONTRACT-CREATE
      - PERM-INVOICE-ISSUE
      - PERM-RECEIPT-RECORD
      - PERM-CONTRACT-QUERY-ALL
  - roleId: ROLE-FINANCE-MANAGER
    name: 财务经理
    inheritsFrom: [ROLE-FINANCE]
    permissions:
      - PERM-CONTRACT-APPROVE-FINANCE
      - PERM-INVOICE-APPROVE
  - roleId: ROLE-GENERAL-MANAGER
    name: 总经理
    permissions:
      - PERM-CONTRACT-APPROVE-LARGE
  - roleId: ROLE-EMPLOYEE
    name: 普通员工
    permissions:
      - PERM-CONTRACT-QUERY-OWN-DEPT

permissions:
  - permissionId: PERM-CONTRACT-CREATE
    targetType: BEHAVIOR
    targetRef: Contract_SaveAsDraft
    dataScope: ALL
  - permissionId: PERM-CONTRACT-QUERY-OWN-DEPT
    targetType: BEHAVIOR
    targetRef: Contract_QueryList
    dataScope: DEPT
    abacCondition: "actor.dept == resource.dept"
  - permissionId: PERM-CONTRACT-APPROVE-FINANCE
    targetType: BEHAVIOR
    targetRef: Contract_ApproveFinance
    dataScope: ALL
  - permissionId: PERM-CONTRACT-APPROVE-LARGE
    targetType: BEHAVIOR
    targetRef: Contract_ApproveGeneralManager
    dataScope: ALL
```

---

# 第六章  M6 流程模型

## 6.1  设计目标与边界

M6 流程模型定义业务工作如何从开始流转到结束，承载两类流程：

1. `COLLABORATION`：端到端业务协同流，例如合同创建、审批、生效、开票、收款和关闭；
2. `APPROVAL`：围绕提交、审批、会签、驳回、退回和通过形成的审批流，可被协同流作为子流程调用。

M6 负责角色任务、系统活动、顺序、并行、条件网关和子流程调用。M6 不重新定义对象、行为、规则或角色，而是通过稳定 ID 引用其他模型。

> **强制角色约束**：所有 `USER_TASK` 和 `APPROVAL_TASK` 的参与人只能通过 `roleRef` 引用 M5 `roles.roleId`。不得引用 `actorId`，不得填写"财务经理"等自由文本，也不得直接绑定具体用户。

> **v9.0 裁剪**：移除事件触发（triggerType=EVENT）、事件等待活动（EVENT_WAIT）与场景调用活动（SCENARIO_CALL）。端到端协同流与审批流均为同步顺序编排，跨对象联动已由 M2 `syncTriggers` 承载，流程只编排粗粒度业务阶段与审批节点。

## 6.2  流程类型及组合关系

### 6.2.1  端到端业务协同流（COLLABORATION）

端到端协同流描述一个业务目标跨阶段、跨对象的完整生命周期。它可以调用 M2 行为、M6 审批子流程。

```text
合同创建（保存草稿/提交）
-> 调用合同审批子流程
-> 合同生效
-> 合同开票
-> 合同收款
-> 合同关闭
```

### 6.2.2  审批流（APPROVAL）

审批流描述由角色承担的人工决策过程。审批条件可直接使用流程表达式，也可通过 `ruleRef` 引用 M3 规则。金额、数量、状态、组织层级等可复用业务判断应优先进入 M3。

```text
合同提交
-> 财务经理审批
-> 合同金额判断
   -> 不超过 100 万元：审批通过
   -> 超过 100 万元：总经理审批
-> 审批完成
```

## 6.3  模型元素规范

### 6.3.1  流程（Flow）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | String | 流程唯一标识，建议格式 `FLOW-{DOMAIN}-{NNN}` |
| name | String | 流程业务名称 |
| flowType | Enum | `COLLABORATION` / `APPROVAL` |
| description | String | 流程目标和边界说明 |
| businessObjectRefs | AggregateRef[] | 流程涉及的 M1 聚合根 |
| roleRefs | RoleRef[] | 流程中允许承担人工活动的 M5 角色集合 |
| trigger | FlowTrigger | 流程启动方式 |
| preconditions | String[] | 流程启动前提 |
| postconditions | String[] | 流程完成后的业务状态 |
| startActivity | ActivityRef | 唯一开始活动 |
| endActivities | ActivityRef[] | 一个或多个合法结束活动 |
| activities | FlowActivity[] | 流程活动和网关集合 |
| version | String | 流程定义版本 |

### 6.3.2  流程触发器（FlowTrigger）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| triggerType | Enum | `MANUAL` / `BEHAVIOR` / `SCHEDULE` / `SUB_FLOW` |
| behaviorRef | BehaviorRef | `BEHAVIOR` 触发时引用 M2 行为 |
| scheduleExpression | String | `SCHEDULE` 触发时的 Cron 或伪代码表达式 |

### 6.3.3  流程活动（FlowActivity）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| activityId | String | 流程内唯一活动标识 |
| name | String | 活动业务名称 |
| activityType | Enum | `START` / `END` / `USER_TASK` / `APPROVAL_TASK` / `SYSTEM_TASK` / `BEHAVIOR_CALL` / `SUB_FLOW_CALL` / `GATEWAY` |
| roleRef | RoleRef | `USER_TASK` 和 `APPROVAL_TASK` 必填，只能引用 M5 角色 |
| behaviorRef | BehaviorRef | `BEHAVIOR_CALL` 或需要落到领域行为的任务引用 M2 行为 |
| subFlowRef | FlowRef | `SUB_FLOW_CALL` 引用 M6 中的另一流程，禁止直接或间接循环调用 |
| ruleRef | RuleRef | 可选，引用 M3 规则作为进入、完成或网关判断条件 |
| conditionExpression | String | 不需要独立复用时可使用的流程局部条件表达式 |
| approvalOutcomes | Enum[] | 审批任务允许的结果，如 `APPROVE` / `REJECT` / `RETURN` |
| timeout | Duration | 活动超时约束（可选） |
| nextActivities | ActivityRef[] | 普通活动的后继活动 |
| branches | FlowBranch[] | `GATEWAY` 的条件分支 |

### 6.3.4  流程分支（FlowBranch）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| branchName | String | 分支名称 |
| ruleRef | RuleRef | 可选，引用 M3 规则 |
| conditionExpression | String | 可选，流程局部判断表达式；与 ruleRef 至少填写一个，默认分支除外 |
| approvalOutcome | Enum | 可选，按 `APPROVE` / `REJECT` / `RETURN` 等审批结果分支 |
| targetActivity | ActivityRef | 目标活动 |
| isDefault | Boolean | 是否默认分支；同一网关最多一个默认分支 |

## 6.4  YAML 元文件模板

```yaml
