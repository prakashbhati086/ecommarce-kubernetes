FROM openjdk:17-jdk-slim

WORKDIR /app

COPY pom.xml .
COPY . ./src

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

RUN mvn clean package -DskipTests

EXPOSE 5003

CMD ["java", "-jar", "target/payment-service-1.0.0.jar"]
