# Use Maven to build the project
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app
COPY . /app
RUN mvn clean package -DskipTests

# Use JDK only for running
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/backend-1.0-SNAPSHOT.jar /app/backend.jar

EXPOSE 8080

CMD ["java", "-jar", "backend.jar"]
