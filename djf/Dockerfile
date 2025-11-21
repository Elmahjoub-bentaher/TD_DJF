FROM eclipse-temurin:17-jdk-alpine


RUN apk add --no-cache bash git
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .



RUN chmod +x gradlew


RUN ./gradlew build -x test --no-daemon || return 0

COPY src src

RUN ./gradlew build -x test --no-daemon


CMD ["java", "-jar", "build/libs/djf-0.0.1-SNAPSHOT.jar"]