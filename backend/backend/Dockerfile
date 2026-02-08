FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
WORKDIR /app/demo
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/demo/target/*.jar app.jar
CMD ["java","-jar","app.jar"]
