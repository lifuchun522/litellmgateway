# 第 02 境换骨：镜像内产物名与容器名同步改为新项目口径。
# 基础镜像沿用本仓库已验证可用的阿里云公共库镜像（含 tzdata，无需再 apt-get/apk 安装）。
FROM registry.cn-shenzhen.aliyuncs.com/juntop/public:eclipse-temurin-17-jre-alpine-1.1

WORKDIR /app

ENV TZ=Asia/Shanghai

# 直接拷贝本地已构建好的 jar（产物名已随换骨改为 llm-gateway.jar）
COPY open-api/qvsu-openapi/target/llm-gateway.jar /app/llm-gateway.jar

EXPOSE 5656

ENTRYPOINT ["java","-jar","/app/llm-gateway.jar"]
