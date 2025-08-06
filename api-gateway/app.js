const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api-gateway' });
});

// Service URLs from environment variables or defaults
const services = {
    user: process.env.USER_SERVICE_URL || 'http://user-service:5001',
    order: process.env.ORDER_SERVICE_URL || 'http://order-service:5002',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5003'
};

// Route to user service
app.use('/api/users', createProxyMiddleware({
    target: services.user,
    changeOrigin: true,
    pathRewrite: {
        '^/api/users': '/api/users'
    }
}));

// Route to order service
app.use('/api/orders', createProxyMiddleware({
    target: services.order,
    changeOrigin: true,
    pathRewrite: {
        '^/api/orders': '/api/orders'
    }
}));

// Route to payment service
app.use('/api/payments', createProxyMiddleware({
    target: services.payment,
    changeOrigin: true,
    pathRewrite: {
        '^/api/payments': '/api/payments'
    }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
