FROM openjdk:17-jdk-slim

WORKDIR /app

# Install curl for health checks and Maven
RUN apt-get update && apt-get install -y curl maven && rm -rf /var/lib/apt/lists/*

COPY pom.xml .
COPY . ./src

RUN mvn clean package -DskipTests

EXPOSE 5003

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5003/health || exit 1

CMD ["java", "-jar", "target/payment-service-1.0.0.jar"]
