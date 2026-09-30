# 轻量级 LLM 网关（llm-gateway）

## 项目说明

精简后的 OpenAPI 管理与网关服务，基于 Spring Boot 2.7 + MyBatis + Shiro，保留基础系统能力与 OpenAPI 核心能力。
第 02 境起对外标识为 `cloud.joysky:llm-gateway`，根包 `cloud.joysky.llmgateway`。

## 目录结构

- `qvsu-openapi`: 后端/前端单模块代码（**目录名有意保留**，第 02 境明确不拆模块、不改目录结构）
- `deploy/local-docker`: 本地 Docker 启动与初始化脚本
- `deploy/dev-docker`: 开发镜像构建脚本
- `sql`: 业务 SQL 脚本与升级脚本

## 本地运行

1. 进入模块目录：`cd qvsu-openapi`
2. 编译：`mvn -B -ntp clean package -DskipTests`
3. 启动：`java -jar target/llm-gateway.jar`（默认端口 5656）
4. 需要换数据源时用 profile：`--spring.profiles.active=local`（PostgreSQL）或 `mysql`

## Docker 本地运行

1. 进入目录：`cd deploy/local-docker`
2. 启动：`docker compose up -d --build`
3. 访问：`http://localhost:5656/login`  admin/admin123

## 换骨期说明（一个月）

配置前缀已从 `qvsu:` 迁移到 `llmgateway:`，兼容期内旧前缀仍可用（会打废弃警告）。
详见 [`../docs/design/ch02-工程脱胎换骨.md`](../docs/design/ch02-工程脱胎换骨.md) 的技术债与删除清单。
