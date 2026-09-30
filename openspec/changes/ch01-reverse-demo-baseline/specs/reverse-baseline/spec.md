# Spec Delta

## Purpose

把一份没有设计文档、没有接口契约、没有迁移说明的既有 Java 工程，转成一份**可回归、可复核、可复现**的 0 号代码基线：后续每一境都要在这条参照线上做增量，因此基线的第一属性不是「能用」，而是「能回到起点」。

本能力在 `open-api.zip`（`open-api/qvsu-openapi`）上首次落地，但能力本身与具体工程无关：换任何一份 Spring Boot 压缩包，同一套流程都必须成立。

## ADDED Requirements

### Requirement: 只读逆向

逆向过程 MUST NOT 修改被逆向工程的任何文件。中间产物 MUST 落在独立的隔离目录，且该目录 MUST NOT 参与版本控制。原始压缩包 MUST NOT 被重新打包或覆盖。

#### Scenario: 解压不覆盖原工程

- **WHEN** 执行逆向扫描
- **THEN** 解压内容落在隔离目录 `.reverse-work/`
- **AND** 已纳入版本控制的 `open-api/` 目录内文件的内容与修改时间不变

#### Scenario: 压缩包指纹不变

- **WHEN** 扫描执行完成后重新计算 `open-api.zip` 的 SHA256
- **THEN** 哈希与扫描开始时记录的 `zip.sha256` 完全一致
- **AND** 哈希为 `A798558197D898011BBBF4AF2A0CA5F84CBFA5480099EE4D3A8E3FBE7F7BBE05`

#### Scenario: 隔离目录不进版本库

- **WHEN** 在仓库根执行 `git status --porcelain`
- **THEN** 输出中不出现 `.reverse-work/` 下的任何路径

### Requirement: 可重跑的扫描

扫描 MUST 由一个随仓库版本化的脚本执行，MUST NOT 依赖运行者的终端历史或记忆。脚本 MUST 在 Linux（bash）与 Windows（PowerShell）两侧都能运行，且两侧产出的清单文件集合一致。

#### Scenario: 同输入产出同结果

- **WHEN** 在同一份 `open-api.zip` 上连续执行两次扫描
- **THEN** 两次产出中「项目根路径、根包名清单、资产清单」三项内容完全一致
- **AND** 接口候选清单的候选条数完全一致

#### Scenario: 产物缺失即失败

- **WHEN** 脚本执行结束
- **THEN** 以下产物均存在且非空：`zip.sha256`、`root.txt`、`packages.txt`、`endpoints.raw.txt`、`assets.txt`
- **AND** 任一产物缺失或为空时脚本以非零退出码结束

#### Scenario: 两套实现产物可比对

- **WHEN** 分别在 Linux 与 Windows 上执行两侧脚本
- **THEN** 两侧都能定位到同一个项目根（压缩包内相对路径相同）
- **AND** 两侧根包名清单的差异为空

### Requirement: As-Is 资产清点

扫描产物 MUST 被整理成一份结构固定的 As-Is 文档，至少覆盖：运行前置条件、模块树、启动入口、接口清单、调用链、数据表关系、页面路由、外部依赖。文档中每一项 MUST 能指回仓库内的文件路径或行号。

#### Scenario: 结构固定

- **WHEN** 打开 `docs/reverse/as-is.md`
- **THEN** 一级章节依次为「运行前置条件、模块树、启动入口、接口清单、调用链、数据模型、页面路由、外部依赖、复用矩阵、缺口清单、风险清单」
- **AND** 「运行前置条件」是第一节，位置在模块树之前

#### Scenario: 结论可指回源码

- **WHEN** 在 As-Is 文档中任取一条关于代码结构的结论
- **THEN** 该结论所在行包含一个仓库内相对路径
- **AND** 该路径在仓库中真实存在

#### Scenario: 环境前置条件可复现

- **WHEN** 一个没有参与逆向的人只拿到压缩包与该文档
- **THEN** 文档中给出了 JDK 版本、Maven 版本、必需外部服务与端口、必需执行的 SQL 脚本路径、已验证的编译与启动命令
- **AND** 按文档操作能在首次尝试内完成编译

### Requirement: 机器候选与人工确认分离

扫描输出的接口清单是**候选**，MUST NOT 直接作为接口事实。每条候选 MUST 带有确认状态，取值限定为「确认 / 否决 / 待验证」，被否决的候选 MUST 附带一句理由。

#### Scenario: 候选带确认状态

- **WHEN** 查看 `docs/reverse/endpoints.md`
- **THEN** 每条候选接口行都包含确认状态列
- **AND** 状态取值只出现在「确认 / 否决 / 待验证」三者之中

#### Scenario: 否决必须给理由

- **WHEN** 某条候选的状态为「否决」
- **THEN** 同行给出否决理由（例如：位于测试类、被注释、仅特定 profile 生效）

#### Scenario: 抽检可复核

- **WHEN** 随机抽取十条候选交给另一位工程师独立复核
- **THEN** 十条的判定结论与原表一致

### Requirement: 复用矩阵可查询

复用判定 MUST 汇总成独立文件，每行 MUST 给出证据列（文件:行号）。判定取值 MUST 限定为五档：直接复用、改名复用、重构复用、废弃、新增。

#### Scenario: 表头固定

- **WHEN** 查看 `docs/reverse/reuse-matrix.md`
- **THEN** 表头依次为「对象、所在路径、判定、理由、证据、生效章节」
- **AND** 「判定」列的取值只出现在五档之内

#### Scenario: 证据可在三十秒内定位

- **WHEN** 任取矩阵中一行，按证据列给出的「文件:行号」打开源码
- **THEN** 指到的位置确实是被判定对象的定义或实现

#### Scenario: 废弃与新增同等重要

- **WHEN** 矩阵中包含「废弃」判定
- **THEN** 每一条「废弃」都写明不保留的理由
- **AND** 每一条「新增」都写明它填补的缺口出处

### Requirement: 缺口与风险分账

「必须补的能力」（缺口）与「可能出问题的地方」（风险）MUST 分开记录。缺口 MUST 按能力域归类并给出建议承接章节；风险 MUST 按严重度排序并给出触发条件。

#### Scenario: 两张表不混用

- **WHEN** 查看 `docs/reverse/gaps-and-risks.md`
- **THEN** 缺口与风险分别位于不同章节
- **AND** 任一缺口条目不含「可能」类措辞，任一风险条目不含「必须实现」类措辞

#### Scenario: 缺口有归属章节

- **WHEN** 查看任一条缺口
- **THEN** 该条给出建议承接的章节编号

#### Scenario: 风险有触发条件

- **WHEN** 查看任一条风险
- **THEN** 该条给出可直接判定的触发条件（例如「JDBC URL 指向本机未监听端口」）
- **AND** 给出严重度

### Requirement: 协议入口缺失必须显式登记

若被逆向工程不存在「与客户端约定的模型调用协议入口」，此项 MUST 作为最高优先级缺口登记，并 MUST NOT 在本境顺手补实现。

#### Scenario: 探测协议入口

- **WHEN** 在接口候选清单中检索 `/v1`、`chat/completions`、`models`、`embeddings`
- **THEN** 记录是否存在匹配的运行时映射

#### Scenario: 缺失登记而非补做

- **WHEN** 探测结果为不存在
- **THEN** `gaps-and-risks.md` 中出现「协议入口缺失」条目并给出建议章节
- **AND** 本境的提交中不包含任何 `/v1` 路由实现

### Requirement: 基线冻结

基线 MUST 以三件可验证的事实冻结：压缩包哈希、可运行命令、Git 分支与提交。

#### Scenario: 冻结记录齐全

- **WHEN** 查看 `docs/reverse/baseline.md`
- **THEN** 记录包含 zip 的 SHA256、解压后的项目根相对路径、编译命令、启动命令
- **AND** 记录包含一次真实的启动验证结果（HTTP 状态码或响应片段）

#### Scenario: 冻结后可回到起点

- **WHEN** 后续任一境怀疑「是不是我改坏了」
- **THEN** 能仅凭 `baseline.md` 中的命令把工程恢复并启动到冻结时的可运行状态
