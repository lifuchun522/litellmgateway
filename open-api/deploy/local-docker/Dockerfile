# 第 02 境换骨：镜像内的产物名由旧 Demo 的产物名改为 llm-gateway.jar。
#
# 原 Dockerfile 的第 14 行用 apt-get 装 tzdata，但基础镜像的 Debian 源已下线
# （docs/reverse/gaps-and-risks.md 的 G8.1/R2 已登记），本境换成按 alpine 基础镜像 + apk 安装，
# 走的是本机已验证可用的镜像仓库路径。
FROM docker.m.daocloud.io/library/maven:3.9.9-eclipse-temurin-8 AS builder

WORKDIR /workspace

# 注意：模块目录名仍是 qvsu-openapi（第 02 境不拆模块、不改目录结构），
# 变的是 Maven 坐标与产物名（llm-gateway.jar）。
COPY qvsu-openapi/pom.xml qvsu-openapi/pom.xml
RUN mvn -B -ntp -T 1C -DskipTests -f qvsu-openapi/pom.xml dependency:go-offline

COPY . .
RUN mvn -B -ntp -T 1C -DskipTests -f qvsu-openapi/pom.xml package


FROM registry.cn-shenzhen.aliyuncs.com/juntop/public:eclipse-temurin-17-jre-alpine-1.1
WORKDIR /app
ENV TZ=Asia/Shanghai
COPY --from=builder /workspace/qvsu-openapi/target/llm-gateway.jar /app/llm-gateway.jar
EXPOSE 5656
ENTRYPOINT ["java","-jar","/app/llm-gateway.jar"]
