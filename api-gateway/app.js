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

console.log('Service URLs:', services);

// Proxy middleware options
const proxyOptions = {
    changeOrigin: true,
    timeout: 10000,
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'Service temporarily unavailable' });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.path} to ${proxyReq.path}`);
    }
};

// Route to user service
app.use('/api/users', createProxyMiddleware({
    target: services.user,
    ...proxyOptions
}));

// Route to order service
app.use('/api/orders', createProxyMiddleware({
    target: services.order,
    ...proxyOptions
}));

// Route to payment service
app.use('/api/payments', createProxyMiddleware({
    target: services.payment,
    ...proxyOptions
}));

// Catch all other routes
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Available routes:');
    console.log('  /health');
    console.log('  /api/users/*');
    console.log('  /api/orders/*');
    console.log('  /api/payments/*');
});
