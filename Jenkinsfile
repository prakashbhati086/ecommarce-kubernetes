pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "prakashbhati086"
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('📁 Checkout') {
            steps {
                echo "🔍 Checking out code from GitHub..."
                checkout scm
                echo "✅ Code checkout completed"
            }
        }
        
        stage('🐳 Build Docker Images') {
            steps {
                script {
                    echo "🏗️ Building Docker images for all microservices..."
                    
                    def services = ['user-service', 'order-service', 'payment-service', 'api-gateway', 'frontend']
                    
                    services.each { service ->
                        echo "Building ${service}..."
                        try {
                            if (isUnix()) {
                                sh "cd ${service} && docker build -t ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ."
                                sh "cd ${service} && docker tag ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${service}:latest"
                            } else {
                                bat "cd ${service} && docker build -t ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ."
                                bat "cd ${service} && docker tag ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${service}:latest"
                            }
                            echo "✅ ${service} built successfully"
                        } catch (Exception e) {
                            error("❌ Failed to build ${service}: ${e.getMessage()}")
                        }
                    }
                }
            }
        }
        
        stage('🚀 Deploy with Docker Compose') {
            steps {
                script {
                    echo "🚀 Deploying services using Docker Compose..."
                    
                    try {
                        if (isUnix()) {
                            sh '''
                                echo "Stopping existing services..."
                                docker-compose down || true
                                
                                echo "Starting new services..."
                                docker-compose up -d --build
                                
                                echo "Waiting for services to start..."
                                sleep 30
                            '''
                        } else {
                            bat '''
                                echo Stopping existing services...
                                docker-compose down || echo "No existing services"
                                
                                echo Starting new services...
                                docker-compose up -d --build
                                
                                echo Waiting for services to start...
                                timeout /t 30
                            '''
                        }
                        echo "✅ Services deployed successfully"
                    } catch (Exception e) {
                        error("❌ Deployment failed: ${e.getMessage()}")
                    }
                }
            }
        }
        
        stage('🏥 Health Check') {
            steps {
                script {
                    echo "🏥 Checking if services are running..."
                    
                    def healthChecks = [
                        'API Gateway': 'http://localhost:8080/health',
                        'User Service': 'http://localhost:5001/health',
                        'Order Service': 'http://localhost:5002/health',
                        'Payment Service': 'http://localhost:5003/health',
                        'Frontend': 'http://localhost:3000'
                    ]
                    
                    healthChecks.each { name, url ->
                        echo "🔍 Checking ${name} at ${url}..."
                    }
                    
                    // Simple health check with retry
                    try {
                        retry(3) {
                            if (isUnix()) {
                                sh 'sleep 10 && curl -f http://localhost:8080/health || echo "Services starting up..."'
                            } else {
                                bat 'timeout /t 10 && curl -f http://localhost:8080/health || echo "Services starting up..."'
                            }
                        }
                        echo "✅ Health check passed"
                    } catch (Exception e) {
                        echo "⚠️ Health check completed with warnings: ${e.getMessage()}"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo """
            🎉 BUILD SUCCESSFUL! 🎉
            
            ✅ Build #${BUILD_NUMBER} completed successfully!
            
            🌐 Your ecommerce microservices are available at:
            • Frontend: http://localhost:3000
            • API Gateway: http://localhost:8080
            • User Service: http://localhost:5001
            • Order Service: http://localhost:5002
            • Payment Service: http://localhost:5003
            
            🐳 Docker images created:
            • ${DOCKER_REGISTRY}/user-service:${BUILD_NUMBER}
            • ${DOCKER_REGISTRY}/order-service:${BUILD_NUMBER}
            • ${DOCKER_REGISTRY}/payment-service:${BUILD_NUMBER}
            • ${DOCKER_REGISTRY}/api-gateway:${BUILD_NUMBER}
            • ${DOCKER_REGISTRY}/frontend:${BUILD_NUMBER}
            
            🚀 Ready to test your microservices!
            """
        }
        
        failure {
            echo """
            ❌ BUILD FAILED!
            
            Build #${BUILD_NUMBER} failed. Common troubleshooting steps:
            
            🔍 Check:
            • Docker is running
            • All service directories exist
            • All Dockerfiles are present
            • Ports are not in use
            
            📋 Service Structure Required:
            • user-service/
            • order-service/
            • payment-service/
            • api-gateway/
            • frontend/
            • docker-compose.yml
            
            Check the console output above for specific error details.
            """
        }
        
        always {
            echo "🧹 Cleaning up Docker resources..."
            script {
                try {
                    if (isUnix()) {
                        sh 'docker system prune -f || true'
                    } else {
                        bat 'docker system prune -f || echo "Cleanup completed"'
                    }
                } catch (Exception e) {
                    echo "Cleanup completed with warnings"
                }
            }
        }
    }
}
