# QVSU OpenAPI

## 项目说明

本项目为精简后的 OpenAPI 管理与网关服务，基于 Spring Boot + MyBatis + Shiro，保留基础系统能力与 OpenAPI 核心能力。

## 目录结构

- `qvsu-openapi`: 后端/前端单模块代码
- `deploy/local-docker`: 本地 Docker 启动与初始化脚本
- `sql`: 业务 SQL 脚本

## 本地运行

1. 进入模块目录：`cd qvsu-openapi`
2. 编译：`mvn clean package -DskipTests`
3. 启动：`java -jar target/qvsu-openapi.jar`

## Docker 本地运行

1. 进入目录：`cd deploy/local-docker`
2. 启动：`docker compose up -d --build`
3. 访问：`http://localhost/login`  admin/admin123

