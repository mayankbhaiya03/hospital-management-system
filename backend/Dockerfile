# ===================================================================
# Stage 1: Build the Spring Boot application using Maven
# ===================================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml first to cache Maven dependency layers
COPY pom.xml .

# Download dependencies in offline mode (leverages Docker build cache)
RUN mvn dependency:go-offline -B

# Copy the application source code
COPY src ./src

# Compile and package the application jar, skipping unit tests for speed in deployment
RUN mvn package -DskipTests -B

# ===================================================================
# Stage 2: Create a secure, lightweight runtime image
# ===================================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a system group and user to run the application (security best practice)
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the packaged jar from the build stage
COPY --from=build /app/target/backend-*.jar app.jar

# Change ownership of the runtime directory to the non-root user
RUN chown -R spring:spring /app

# Switch to the non-root user
USER spring:spring

# Expose the port the app runs on
EXPOSE 8080

# Environment variables with defaults (can be overridden at runtime)
ENV SPRING_PROFILES_ACTIVE=prod \
    PORT=8080

# Use optimized JVM runtime parameters for container environments
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
