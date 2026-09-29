FROM docker.m.daocloud.io/library/maven:3.9.9-eclipse-temurin-8 AS builder

WORKDIR /workspace

COPY qvsu-openapi/pom.xml qvsu-openapi/pom.xml
RUN mvn -B -ntp -T 1C -DskipTests -f qvsu-openapi/pom.xml dependency:go-offline

COPY . .
RUN mvn -B -ntp -T 1C -DskipTests -f qvsu-openapi/pom.xml package


FROM docker.m.daocloud.io/library/eclipse-temurin:8-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends tzdata fontconfig fonts-dejavu-core && rm -rf /var/lib/apt/lists/* && ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo Asia/Shanghai > /etc/timezone
ENV TZ=Asia/Shanghai
COPY --from=builder /workspace/qvsu-openapi/target/qvsu-openapi.jar /app/qvsu-openapi.jar
EXPOSE 80
ENTRYPOINT ["java","-jar","/app/qvsu-openapi.jar"]
