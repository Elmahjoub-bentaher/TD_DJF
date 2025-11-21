#FROM eclipse-temurin:17-jdk-alpine
#
#
#RUN apk add --no-cache bash git
#WORKDIR /app
#
#COPY gradlew .
#COPY gradle gradle
#COPY build.gradle .
#COPY settings.gradle .
#
#
#
#RUN chmod +x gradlew
#
#
#RUN ./gradlew build -x test --no-daemon || return 0
#
#COPY src src
#
#RUN ./gradlew build -x test --no-daemon
#
#
#CMD ["java", "-jar", "build/libs/djf-0.0.1-SNAPSHOT.jar"]




FROM gradle:8-jdk17-alpine AS builder

WORKDIR /app

COPY --chown=gradle:gradle . .


RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app


COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]