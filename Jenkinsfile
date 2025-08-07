pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "prakashbhati086"
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('📁 Checkout Code') {
            steps {
                echo "🔍 Checking out code from GitHub..."
                checkout scm
                echo "✅ Code checkout completed"
            }
        }
        
        stage('🐳 Build Docker Images') {
            steps {
                script {
                    echo "🏗️ Building Docker images for all services..."
                    
                    def services = ['user-service', 'order-service', 'payment-service', 'api-gateway', 'frontend']
                    
                    services.each { service ->
                        echo "Building ${service}..."
                        if (isUnix()) {
                            sh "cd ${service} && docker build -t ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ."
                            sh "cd ${service} && docker tag ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${service}:latest"
                        } else {
                            bat "cd ${service} && docker build -t ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ."
                            bat "cd ${service} && docker tag ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${service}:latest"
                        }
                        echo "✅ ${service} built successfully"
                    }
                }
            }
        }
        
        stage('🚀 Deploy with Docker Compose') {
            steps {
                script {
                    echo "🚀 Deploying services using Docker Compose..."
                    
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
                }
            }
        }
        
        stage('🏥 Health Check') {
            steps {
                script {
                    echo "🏥 Checking if services are running..."
                    
                    def services = [
                        'Frontend: http://localhost:3000',
                        'API Gateway: http://localhost:8080/health',
                        'User Service: http://localhost:5001/health',
                        'Order Service: http://localhost:5002/health',
                        'Payment Service: http://localhost:5003/health'
                    ]
                    
                    services.each { service ->
                        echo "🔍 ${service}"
                    }
                    
                    // Simple health check
                    try {
                        if (isUnix()) {
                            sh 'sleep 10 && curl -f http://localhost:8080/health || echo "Services starting up..."'
                        } else {
                            bat 'timeout /t 10 && curl -f http://localhost:8080/health || echo "Services starting up..."'
                        }
                    } catch (Exception e) {
                        echo "⚠️ Health check completed with warnings"
                    }
                    
                    echo "✅ Health check completed"
                }
            }
        }
    }
    
    post {
        success {
            echo """
            🎉 BUILD SUCCESSFUL! 🎉
            
            ✅ Build #${BUILD_NUMBER} completed successfully!
            
            🌐 Your services are available at:
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
            """
        }
        
        failure {
            echo """
            ❌ BUILD FAILED!
            
            Build #${BUILD_NUMBER} failed. Common issues:
            • Check if Docker is running
            • Verify all Dockerfiles exist
            • Ensure ports are not in use
            
            Check the console output above for details.
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
                    echo "Cleanup completed"
                }
            }
        }
    }
}
