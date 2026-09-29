FROM registry.cn-shenzhen.aliyuncs.com/chaoqs/openjdk:8-jdk-alpine

WORKDIR /app

# 换国内源 + 安装依赖
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache tzdata fontconfig ttf-dejavu && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

ENV TZ=Asia/Shanghai

# 直接拷贝本地已构建好的 jar
COPY  open-api/qvsu-openapi/target/*.jar  /app/qvsu-openapi.jar

EXPOSE 5656

ENTRYPOINT ["java","-jar","/app/qvsu-openapi.jar"]