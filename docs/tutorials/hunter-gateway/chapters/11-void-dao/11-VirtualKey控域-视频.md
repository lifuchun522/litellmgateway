# 荒天帝炼大模型网关-第11境-虚道境-蛄族宝术-VirtualKey控域

> 第 11 境 · 虚道境 · 蛄族宝术 · VirtualKey控域
> 类型：视频脚本　来源：素材库 material_id=1350

---

第11章只做：Project 聚合权限和成本，VirtualKey 必须挂 Project，不做全局裸 Key。
客户要的是自助发 Key、看用量、控模型权限。如果每次都要管理员手工配，这个网关卖不出价格。
一线最怕 Key 泄露和误用。禁用后必须立刻失效，不能让客户等缓存过期，否则信任直接崩。
我查了 LiteLLM 和 One-API：成熟网关都把 Key 绑定项目或团队，明文只在创建时返回一次。这是趋势。
一期范围冻结为五个页面：Project、VirtualKey、创建Key、模型权限、用量。角色先固定五种，不做自定义 RBAC。
方案A：Key 直接挂模型和预算，简单但成本散。方案B：Project 聚合，Key 只做子限额。我倾向 B。
鉴权链我拆成五步：Bearer 解析、Key 哈希、状态过期 IP、Project 归属、模型 ACL。每步都要能独立失败。
当前基线是零：没有 Project，Key 全局，成本算不清。成功线是无权模型 403 率 100%，禁用 Key 零放行。
开发者会搜 Java LLM Gateway 密钥权限。文档要把 Project 和 VirtualKey 的关系讲清楚，才能带来自然流量。
这次不投付费广告。CAC 会超过开源工具的自然获客成本。先靠 GitHub 和文档验证，预算留给后续案例。
预算线：本章最多投入 8 人天，云资源每月不超过 300 元。ROI 门槛是三个月内减少 30% 手工配 Key 工单。
Key 明文只展示一次，日志不得落明文。管理员、项目负责人、开发者、审计员必须写清权限边界，谁授权谁负责。
执行顺序：先 Project 数据模型，再 VirtualKey 哈希与鉴权链，然后五页面，最后 ACL 与审计。阻塞点必须当天上报。
听了成本和合规，我不再要求自定义 RBAC。一期就五种角色，但创建 Key 必须让开发者三分钟内完成。
如果禁用 Key 依赖缓存刷新，一线仍然会收到投诉。Alex 必须给出版本号或发布订阅方案，做到立即失效。
反证也有：部分网关把 Project 做得很重，导致上手慢。所以我们的 Project 只保留权限、预算、模型 ACL 三件事。
范围再冻：用量页面一期只读，不做导出；模型权限只支持允许列表；创建 Key 后明文弹窗只出现一次。
最终 Trade-off：牺牲 Key 级独立预算，换 Project 级成本聚合和权限边界。Key 只保留 rpm、tpm 和子预算。
实现路径：Project 聚合成本，VirtualKey 存 prefix 和 hash，禁用走 Redis 版本号。过期直接 401，重复调用幂等。
上线成功线：无权模型 403 达 100%，禁用或过期 Key 放行数为零。停止线是 403 误杀正常调用超过 1%。
自然增长验证：发布 Project 与 VirtualKey 鉴权链文档，跟踪搜索词到仓库 Star 和 Demo 启动数，转化低就调整标题。
这次付费预算为零。如果后续要投，必须先埋转化事件：创建 Key、首次调用、403 拦截。没有归因，一块钱也不投。
预算维持 8 人天和月 300 元。止损条件：两周内鉴权链没跑通，就砍掉用量页面，只保 Project、Key 和 ACL。
红线确认：明文只展示一次，哈希加盐，审计日志记录操作者和时间。越权模型返回 403，责任在 Project 负责人。
Owner：Bob 模型，Alex 鉴权链，Emma 页面验收，David 指标。周五前合并分支，验收是无权模型 403、禁用 Key 即失效。
拍板：chapter/11-virtual-key-project 分支落地。Project 聚合权限成本，VirtualKey 挂 Project，403 和禁用即失效。

---

## 摘要

第11章在 Demo 上增量实现 Project 作为权限与成本聚合边界，VirtualKey 归属 Project，补齐五角色五页面与鉴权链，验收 403 和

## 标签

`后端` `架构` `安全`

## 分镜

### 分镜 1
- **role**：老板马斯克
- **text**：第11章只做：Project 聚合权限和成本，VirtualKey 必须挂 Project，不做全局裸 Key。
- **point**：Project 聚合权限成本
- **title**：老板马斯克 · 定边界
### 分镜 2
- **role**：业务乔布斯
- **text**：客户要的是自助发 Key、看用量、控模型权限。如果每次都要管理员手工配，这个网关卖不出价格。
- **point**：自助与用量是卖点
- **title**：业务乔布斯 · 问价值
### 分镜 3
- **role**：售后贝索斯
- **text**：一线最怕 Key 泄露和误用。禁用后必须立刻失效，不能让客户等缓存过期，否则信任直接崩。
- **point**：禁用必须立即生效
- **title**：售后贝索斯 · 看客户
### 分镜 4
- **role**：深度研究员Iris
- **text**：我查了 LiteLLM 和 One-API：成熟网关都把 Key 绑定项目或团队，明文只在创建时返回一次。这是趋势。
- **point**：证据指向项目级聚合
- **title**：深度研究员Iris · 摆证据
### 分镜 5
- **role**：产品经理Emma
- **text**：一期范围冻结为五个页面：Project、VirtualKey、创建Key、模型权限、用量。角色先固定五种，不做自定义 RBAC。
- **point**：五页面五角色，不做自定义
- **title**：产品经理Emma · 收范围
### 分镜 6
- **role**：架构师Bob
- **text**：方案A：Key 直接挂模型和预算，简单但成本散。方案B：Project 聚合，Key 只做子限额。我倾向 B。
- **point**：A简单，B可聚合成本
- **title**：架构师Bob · 比方案
### 分镜 7
- **role**：工程师Alex
- **text**：鉴权链我拆成五步：Bearer 解析、Key 哈希、状态过期 IP、Project 归属、模型 ACL。每步都要能独立失败。
- **point**：五步鉴权链可独立失败
- **title**：工程师Alex · 拆链路
### 分镜 8
- **role**：数据分析师David
- **text**：当前基线是零：没有 Project，Key 全局，成本算不清。成功线是无权模型 403 率 100%，禁用 Key 零放行。
- **point**：基线零，403 必须 100%
- **title**：数据分析师David · 定基线
### 分镜 9
- **role**：SEO专家Sarah
- **text**：开发者会搜 Java LLM Gateway 密钥权限。文档要把 Project 和 VirtualKey 的关系讲清楚，才能带来自然流量。
- **point**：文档讲清关系带流量
- **title**：SEO专家Sarah · 找入口
### 分镜 10
- **role**：广告专家Adrian
- **text**：这次不投付费广告。CAC 会超过开源工具的自然获客成本。先靠 GitHub 和文档验证，预算留给后续案例。
- **point**：不投广告，靠自然增长
- **title**：广告专家Adrian · 算CAC
### 分镜 11
- **role**：财务巴菲特
- **text**：预算线：本章最多投入 8 人天，云资源每月不超过 300 元。ROI 门槛是三个月内减少 30% 手工配 Key 工单。
- **point**：8人天，月云费300元
- **title**：财务巴菲特 · 锁预算
### 分镜 12
- **role**：法务芒格
- **text**：Key 明文只展示一次，日志不得落明文。管理员、项目负责人、开发者、审计员必须写清权限边界，谁授权谁负责。
- **point**：明文一次，日志不落
- **title**：法务芒格 · 划责任
### 分镜 13
- **role**：团队负责人Mike
- **text**：执行顺序：先 Project 数据模型，再 VirtualKey 哈希与鉴权链，然后五页面，最后 ACL 与审计。阻塞点必须当天上报。
- **point**：先模型，再鉴权，后页面
- **title**：团队负责人Mike · 排顺序
### 分镜 14
- **role**：业务乔布斯
- **text**：听了成本和合规，我不再要求自定义 RBAC。一期就五种角色，但创建 Key 必须让开发者三分钟内完成。
- **point**：砍自定义，保三分钟创建
- **title**：业务乔布斯 · 改承诺
### 分镜 15
- **role**：售后贝索斯
- **text**：如果禁用 Key 依赖缓存刷新，一线仍然会收到投诉。Alex 必须给出版本号或发布订阅方案，做到立即失效。
- **point**：缓存必须立即失效
- **title**：售后贝索斯 · 验一线
### 分镜 16
- **role**：深度研究员Iris
- **text**：反证也有：部分网关把 Project 做得很重，导致上手慢。所以我们的 Project 只保留权限、预算、模型 ACL 三件事。
- **point**：Project 只做三件事
- **title**：深度研究员Iris · 补反证
### 分镜 17
- **role**：产品经理Emma
- **text**：范围再冻：用量页面一期只读，不做导出；模型权限只支持允许列表；创建 Key 后明文弹窗只出现一次。
- **point**：用量只读，权限允许列表
- **title**：产品经理Emma · 冻范围
### 分镜 18
- **role**：架构师Bob
- **text**：最终 Trade-off：牺牲 Key 级独立预算，换 Project 级成本聚合和权限边界。Key 只保留 rpm、tpm 和子预算。
- **point**：牺牲 Key 独立预算
- **title**：架构师Bob · 给取舍
### 分镜 19
- **role**：工程师Alex
- **text**：实现路径：Project 聚合成本，VirtualKey 存 prefix 和 hash，禁用走 Redis 版本号。过期直接 401，重复调用幂等。
- **point**：版本号保证秒级失效
- **title**：工程师Alex · 落实现
### 分镜 20
- **role**：数据分析师David
- **text**：上线成功线：无权模型 403 达 100%，禁用或过期 Key 放行数为零。停止线是 403 误杀正常调用超过 1%。
- **point**：403 零误杀，放行零
- **title**：数据分析师David · 定指标
### 分镜 21
- **role**：SEO专家Sarah
- **text**：自然增长验证：发布 Project 与 VirtualKey 鉴权链文档，跟踪搜索词到仓库 Star 和 Demo 启动数，转化低就调整标题。
- **point**：搜词到 Star 验证
- **title**：SEO专家Sarah · 给路径
### 分镜 22
- **role**：广告专家Adrian
- **text**：这次付费预算为零。如果后续要投，必须先埋转化事件：创建 Key、首次调用、403 拦截。没有归因，一块钱也不投。
- **point**：无归因不投，预算为零
- **title**：广告专家Adrian · 归因
### 分镜 23
- **role**：财务巴菲特
- **text**：预算维持 8 人天和月 300 元。止损条件：两周内鉴权链没跑通，就砍掉用量页面，只保 Project、Key 和 ACL。
- **point**：两周不通，砍用量页
- **title**：财务巴菲特 · 锁ROI
### 分镜 24
- **role**：法务芒格
- **text**：红线确认：明文只展示一次，哈希加盐，审计日志记录操作者和时间。越权模型返回 403，责任在 Project 负责人。
- **point**：哈希加盐，审计留痕
- **title**：法务芒格 · 给红线
### 分镜 25
- **role**：团队负责人Mike
- **text**：Owner：Bob 模型，Alex 鉴权链，Emma 页面验收，David 指标。周五前合并分支，验收是无权模型 403、禁用 Key 即失效。
- **point**：周五合并分支
- **title**：团队负责人Mike · 落执行
### 分镜 26
- **role**：老板马斯克
- **text**：拍板：chapter/11-virtual-key-project 分支落地。Project 聚合权限成本，VirtualKey 挂 Project，403 和禁用即失效。
- **point**：拍板：Project 聚合，Key 挂靠
- **title**：老板马斯克 · 拍板
