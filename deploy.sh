#!/bin/bash

echo "🚀 Deploying E-commerce Microservices to Kubernetes"
echo "=================================================="

# Create namespace
echo "📁 Creating namespace..."
kubectl apply -f k8s/namespaces/

# Create storage components
echo "💾 Setting up persistent storage..."
kubectl apply -f k8s/storage/

# Create ConfigMaps and Secrets
echo "⚙️ Applying configuration..."
kubectl apply -f k8s/configmaps/

# Deploy MongoDB first
echo "🗄️ Deploying MongoDB..."
kubectl apply -f k8s/deployments/mongodb-deployment.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n ecommerce

# Deploy microservices
echo "🔧 Deploying microservices..."
kubectl apply -f k8s/deployments/user-service-deployment.yaml
kubectl apply -f k8s/deployments/order-service-deployment.yaml
kubectl apply -f k8s/deployments/payment-service-deployment.yaml

# Wait for backend services
echo "⏳ Waiting for backend services..."
kubectl wait --for=condition=available --timeout=300s deployment/user-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/order-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/payment-service -n ecommerce

# Deploy API Gateway
echo "🌐 Deploying API Gateway..."
kubectl apply -f k8s/deployments/api-gateway-deployment.yaml

# Wait for API Gateway
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n ecommerce

# Deploy Frontend
echo "🎨 Deploying Frontend..."
kubectl apply -f k8s/deployments/frontend-deployment.yaml

# Deploy Ingress
echo "🔗 Setting up ingress..."
kubectl apply -f k8s/ingress/

# Final status check
echo "✅ Deployment complete! Checking status..."
kubectl get all -n ecommerce

echo ""
echo "🎉 E-commerce Microservices deployed successfully!"
echo ""
echo "📊 Access your application:"
echo "• Frontend: http://ecommerce.local"
echo "• API Gateway: http://api.ecommerce.local"
echo ""
echo "🔧 Useful commands:"
echo "• View pods: kubectl get pods -n ecommerce"
echo "• View services: kubectl get services -n ecommerce"
echo "• View logs: kubectl logs -f deployment/[service-name] -n ecommerce"
echo "• Scale service: kubectl scale deployment [service-name] --replicas=3 -n ecommerce"
