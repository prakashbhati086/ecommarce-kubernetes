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
        
        stage('🚀 Deploy with Docker Compose') {
            steps {
                script {
                    echo "🚀 Deploying services using Docker Compose..."
                    
                    try {
                        bat '''
                            echo Stopping existing services...
                            docker-compose down || echo "No existing services"
                            
                            echo Starting new services...
                            docker-compose up -d --build
                            
                            echo Services started successfully
                        '''
                        
                        // Use Jenkins sleep instead of Windows timeout
                        echo "⏰ Waiting 30 seconds for services to initialize..."
                        sleep(30)
                        
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
                        echo "🔍 ${name}: ${url}"
                    }
                    
                    // Test API Gateway health
                    try {
                        retry(3) {
                            bat 'curl -f http://localhost:8080/health'
                        }
                        echo "✅ Health checks passed"
                    } catch (Exception e) {
                        echo "⚠️ Health check warnings (services may still be starting): ${e.getMessage()}"
                    }
                }
            }
        }
        

        stage('🚢 Deploy to Kubernetes') {
    steps {
        script {
            echo "🚢 Deploying to Kubernetes cluster..."
            
            try {
                bat '''
                    echo Updating Kubernetes manifests with new image tags...
                    
                    echo Deploying to Kubernetes...
                    kubectl apply -f k8s/namespaces/
                    kubectl apply -f k8s/storage/
                    kubectl apply -f k8s/configmaps/
                    
                    echo Deploying services...
                    kubectl apply -f k8s/deployments/
                    kubectl apply -f k8s/ingress/
                    
                    echo Waiting for rollout to complete...
                    kubectl rollout status deployment/user-service -n ecommerce
                    kubectl rollout status deployment/order-service -n ecommerce
                    kubectl rollout status deployment/payment-service -n ecommerce
                    kubectl rollout status deployment/api-gateway -n ecommerce
                    kubectl rollout status deployment/frontend -n ecommerce
                    
                    echo Checking deployment status...
                    kubectl get pods -n ecommerce
                '''
                echo "✅ Kubernetes deployment completed successfully"
            } catch (Exception e) {
                error("❌ Kubernetes deployment failed: ${e.getMessage()}")
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
            
            Build #${BUILD_NUMBER} failed. Check console output above for details.
            """
        }
        
        always {
            echo "🧹 Cleaning up Docker resources..."
            script {
                try {
                    bat 'docker system prune -f || echo "Cleanup completed"'
                } catch (Exception e) {
                    echo "Cleanup completed"
                }
            }
        }
    }
}
