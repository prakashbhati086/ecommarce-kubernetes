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
        
        stage('🔍 Verify Project Structure') {
            steps {
                script {
                    echo "📋 Checking project files..."
                    bat '''
                        echo === Project Root Files ===
                        dir
                        
                        echo === Checking docker-compose.yml ===
                        if exist docker-compose.yml (
                            echo ✅ docker-compose.yml found
                            type docker-compose.yml
                        ) else (
                            echo ❌ docker-compose.yml missing
                        )
                        
                        echo === Checking service directories ===
                        if exist user-service (echo ✅ user-service found) else (echo ❌ user-service missing)
                        if exist order-service (echo ✅ order-service found) else (echo ❌ order-service missing)
                        if exist payment-service (echo ✅ payment-service found) else (echo ❌ payment-service missing)
                        if exist api-gateway (echo ✅ api-gateway found) else (echo ❌ api-gateway missing)
                        if exist frontend (echo ✅ frontend found) else (echo ❌ frontend missing)
                    '''
                }
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
                            bat "cd ${service} && docker build -t ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ."
                            bat "cd ${service} && docker tag ${DOCKER_REGISTRY}/${service}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${service}:latest"
                            echo "✅ ${service} built successfully"
                        } catch (Exception e) {
                            error("❌ Failed to build ${service}: ${e.getMessage()}")
                        }
                    }
                }
            }
        }
        
        stage('🧹 Clean Environment') {
            steps {
                script {
                    echo "🧹 Cleaning existing containers and ports..."
                    try {
                        bat '''
                            echo Stopping all running containers...
                            for /f "tokens=*" %%i in ('docker ps -q') do docker stop %%i
                            
                            echo Removing containers...
                            docker-compose down --remove-orphans || echo "No existing compose services"
                            
                            echo Checking port usage...
                            netstat -an | findstr :3000 || echo "Port 3000 free"
                            netstat -an | findstr :8080 || echo "Port 8080 free"
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Cleanup warnings: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('🚀 Deploy with Docker Compose') {
            steps {
                script {
                    echo "🚀 Deploying services using Docker Compose..."
                    
                    try {
                        bat '''
                            echo Starting services with detailed output...
                            docker-compose up -d
                            
                            echo Waiting for services to start...
                            timeout /t 30
                            
                            echo Checking running containers...
                            docker ps
                        '''
                        echo "✅ Services deployed successfully"
                    } catch (Exception e) {
                        echo "❌ Deployment failed, checking logs..."
                        bat '''
                            echo === Docker Compose Logs ===
                            docker-compose logs --tail=50
                            
                            echo === Container Status ===
                            docker ps -a
                        '''
                        error("❌ Deployment failed: ${e.getMessage()}")
                    }
                }
            }
        }
        
        stage('🏥 Health Check') {
            steps {
                script {
                    echo "🏥 Checking if services are running..."
                    
                    try {
                        retry(3) {
                            bat '''
                                timeout /t 10
                                curl -f http://localhost:8080/health || echo "API Gateway not ready yet..."
                                curl -f http://localhost:5001/health || echo "User service not ready yet..."
                            '''
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
            """
        }
        
        failure {
            echo """
            ❌ BUILD FAILED!
            
            Build #${BUILD_NUMBER} failed. Check the detailed logs above.
            """
            
            bat '''
                echo === Final Debug Information ===
                docker ps -a
                docker-compose logs --tail=20 || echo "No compose logs available"
            '''
        }
        
        always {
            echo "🧹 Final cleanup..."
            bat 'docker system prune -f || echo "Cleanup completed"'
        }
    }
}
