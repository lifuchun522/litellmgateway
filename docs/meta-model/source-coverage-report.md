# 源码覆盖对账报告（Source Coverage Report）

> 产物语言：zh-CN ｜ 覆盖分母来自 [`source-asset-inventory.md`](./source-asset-inventory.md) 与对 `open-api/` 的独立扫描，不等于「已写入文档的节点数」。

## 1. 按资产类型的覆盖统计

| Asset Type | Discovered | Modeled | Excluded | Unassigned | Coverage |
|---|---:|---:|---:|---:|---:|
| 模块/服务 | 6 | 6 | 0 | 0 | 100% |
| 交互入口（菜单 M+C） | 17 | 17 | 0 | 0 | 100% |
| 交互入口（按钮权限 F） | 57 | 57 | 0 | 0 | 100% |
| 自动入口（注解式 Job/Event） | 0 | 0 | 0 | 0 | 不适用（本系统用 Quartz 数据库调度） |
| HTTP 端点（API） | 184 | 184 | 0 | 0 | 100% |
| 非端点接口（网关/异常/调度入口） | 10 | 10 | 0 | 0 | 100% |
| 领域对象（OBJ） | 33 | 33 | 0 | 0 | 100% |
| DAO/Mapper 接口与 XML | 144（语句）/ 19（接口） | 144 | 0 | 0 | 100% |
| Mapper XML 文件 | 18 | 18 | 0 | 0 | 100% |
| 物理表（去重） | 34 | 34 | 0 | 0 | 100% |
| 表字段 | 865（含方言重复） | 34 节 | 0 | 0 | 100% |
| 视图模板 | 144 | 71 | 73 | 0 | 100% |
| 第三方前端库文件 | 74 | 0 | 74 | 0 | 排除 |
| 配置键 | 29 | 29 | 0 | 0 | 100% |
| 权限码 | 55 | 55 | 0 | 0 | 100% |
| 入口/DAO/模型源码文件 | 60 | 60 | 0 | 0 | 100% |

## 2. 逐项对账：Controller 路由是否全部归属

| 端点总数 | 已归属功能 | 未归属 |
|---|---:|---:|
| 184 | 184 | 0 |

全部 184 个端点均可在 [`interface-index.md`](./interface-index.md) 找到 `API-*` 主定义，并通过「消费者功能」字段归属到 [`functional-inventory.md`](./functional-inventory.md) 的 `FUNC-*`。

## 3. 逐项对账：Job/Event/Callback 是否全部归属

源码中注解式触发器数量为 **0**。本系统的自动化能力由 Quartz 数据库调度承担，已在 [`interface-index.md`](./interface-index.md) 中以 `JOB-quartz-dispatch` 节点登记，并归属 `FUNC-job-scheduler`；无遗漏。

## 4. 逐项对账：DAO/Mapper 是否全部映射数据对象

| Mapper 文件 | 语句数 | 映射表 |
|---|---:|---|
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | 7 | 由命名空间 `com.qvsu.quartz.mapper.SysJobLogMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | 7 | 由命名空间 `com.qvsu.quartz.mapper.SysJobMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | 8 | 由命名空间 `com.qvsu.system.mapper.SysConfigMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | 13 | 由命名空间 `com.qvsu.system.mapper.SysDeptMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | 10 | 由命名空间 `com.qvsu.system.mapper.SysDictDataMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | 9 | 由命名空间 `com.qvsu.system.mapper.SysDictTypeMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysLogininforMapper.xml` | 4 | 由命名空间 `com.qvsu.system.mapper.SysLogininforMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | 16 | 由命名空间 `com.qvsu.system.mapper.SysMenuMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysNoticeMapper.xml` | 5 | 由命名空间 `com.qvsu.system.mapper.SysNoticeMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` | 5 | 由命名空间 `com.qvsu.system.mapper.SysOperLogMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | 9 | 由命名空间 `com.qvsu.system.mapper.SysPostMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleDeptMapper.xml` | 4 | 由命名空间 `com.qvsu.system.mapper.SysRoleDeptMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | 9 | 由命名空间 `com.qvsu.system.mapper.SysRoleMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysRoleMenuMapper.xml` | 4 | 由命名空间 `com.qvsu.system.mapper.SysRoleMenuMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | 18 | 由命名空间 `com.qvsu.system.mapper.SysUserMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserOnlineMapper.xml` | 5 | 由命名空间 `com.qvsu.system.mapper.SysUserOnlineMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserPostMapper.xml` | 4 | 由命名空间 `com.qvsu.system.mapper.SysUserPostMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |
| `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | 7 | 由命名空间 `com.qvsu.system.mapper.SysUserRoleMapper` 推断，实体见 [`domain-model.md`](./domain-model.md) |

## 5. 逐项对账：Model 是否全部分类

扫描到 33 个领域对象，全部在 [`domain-model.md`](./domain-model.md) 中分类为 entity / value-object / DTO。无未分类模型。

## 6. 逐项对账：表/视图是否都有字段设计

| 物理表 | 有字段设计 | 无字段设计 |
|---|---:|---:|
| 34 | 34 | 0 |

源码中不存在视图、物化视图、存储过程与触发器（见 [`database-inventory.md`](./database-inventory.md) 第 3 节）。

## 7. 逐项对账：组件能力与配置是否有消费者

- 配置键 29 个，全部在 [`config-index.md`](./config-index.md) 登记并标注消费者。
- 技术组件与能力接口见 [`technical-component-index.md`](./technical-component-index.md)。
- 公共能力与消费者见 [`common-capability-index.md`](./common-capability-index.md)。

## 8. 未归属资产清单

| 资产类型 | 未归属数 | 清单 |
|---|---:|---|
| 入口 Controller | 0 | 无 |
| API 端点 | 0 | 无 |
| Job/Event | 0 | 无 |
| DAO/Mapper | 0 | 无 |
| 领域对象 | 0 | 无 |
| 物理表 | 0 | 无 |
| 配置键 | 0 | 无 |

> 结论：范围内不存在未归属的核心资产。`supporting` 状态的辅助类（工具类、常量、枚举、静态脚本）已在 [source-asset-inventory.md](./source-asset-inventory.md) 中登记并标注为「支撑类，非独立业务入口」。

## 9. 聚合节点展开检查

| 检查项 | 结果 |
|---|---|
| 是否用「接口组」代替具体接口 | 否，184 个端点逐个建 `API-*` 节点 |
| 是否用「逻辑数据集」代替物理表 | 否，34 张物理表逐个建 `TBL-*` 节点 |
| 是否用 `CAP-*` 代替 `FUNC-*` | 否，能力分组仅作导航，功能逐个建 `FUNC-*` |
| 是否把多张物理表合并为一个 `TBL-*` | 否，一表一 ID |

## 10. 相关文档

- 资产台账：[`source-asset-inventory.md`](./source-asset-inventory.md)
- 一致性报告：[`consistency-report.md`](./consistency-report.md)
- 进度与未决问题：[`PROGRESS.md`](./PROGRESS.md)
