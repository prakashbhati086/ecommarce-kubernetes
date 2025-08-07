import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

function App() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const showMessage = (msg, isError = false) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target;
        
        try {
            await axios.post(`${API_BASE}/users/register`, {
                username: form.username.value,
                email: form.email.value,
                password: form.password.value
            });
            showMessage('Registration successful!');
            form.reset();
        } catch (error) {
            showMessage(`Registration failed: ${error.response?.data?.error || error.message}`, true);
        }
        setLoading(false);
    };

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target;
        
        try {
            const response = await axios.post(`${API_BASE}/users/login`, {
                username: form.username.value,
                password: form.password.value
            });
            setUser(response.data);
            showMessage('Login successful!');
            form.reset();
        } catch (error) {
            showMessage(`Login failed: ${error.response?.data?.error || error.message}`, true);
        }
        setLoading(false);
    };

    const createOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target;
        
        try {
            await axios.post(`${API_BASE}/orders`, {
                user_id: user.user_id,
                product_name: form.product.value,
                quantity: parseInt(form.quantity.value),
                price: parseFloat(form.price.value)
            });
            showMessage('Order created successfully!');
            form.reset();
            loadOrders();
        } catch (error) {
            showMessage(`Order creation failed: ${error.response?.data?.error || error.message}`, true);
        }
        setLoading(false);
    };

    const loadOrders = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`${API_BASE}/orders/user/${user.user_id}`);
            setOrders(response.data.orders);
        } catch (error) {
            showMessage(`Failed to load orders: ${error.response?.data?.error || error.message}`, true);
        }
    };

    const processPayment = async (orderId, amount) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/payments/process`, {
                order_id: orderId,
                amount: amount,
                card_number: '1234567890123456' // Demo card
            });
            
            if (response.data.status === 'success') {
                showMessage(`Payment successful! Transaction: ${response.data.transaction_id}`);
            } else {
                showMessage('Payment failed!', true);
            }
        } catch (error) {
            showMessage(`Payment failed: ${error.response?.data?.error || error.message}`, true);
        }
        setLoading(false);
    };

    const logout = () => {
        setUser(null);
        setOrders([]);
        showMessage('Logged out successfully!');
    };

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const styles = {
        container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
        form: { border: '1px solid #ddd', padding: '20px', margin: '20px 0', borderRadius: '5px' },
        input: { display: 'block', width: '100%', padding: '8px', margin: '10px 0', borderRadius: '3px', border: '1px solid #ddd' },
        button: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
        message: { padding: '10px', margin: '10px 0', borderRadius: '3px', backgroundColor: message.includes('failed') || message.includes('Failed') ? '#f8d7da' : '#d4edda' },
        orderCard: { border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px', backgroundColor: '#f9f9f9' }
    };

    return (
        <div style={styles.container}>
            <h1>🛍️ E-commerce Microservices App</h1>
            
            {message && <div style={styles.message}>{message}</div>}
            
            {!user ? (
                <div>
                    <div style={styles.form}>
                        <h2>Register</h2>
                        <form onSubmit={register}>
                            <input name="username" placeholder="Username" required style={styles.input} />
                            <input name="email" type="email" placeholder="Email" required style={styles.input} />
                            <input name="password" type="password" placeholder="Password" required style={styles.input} />
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    </div>

                    <div style={styles.form}>
                        <h2>Login</h2>
                        <form onSubmit={login}>
                            <input name="username" placeholder="Username" required style={styles.input} />
                            <input name="password" type="password" placeholder="Password" required style={styles.input} />
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={styles.form}>
                        <h2>Welcome, {user.username}! ({user.email})</h2>
                        <button onClick={logout} style={styles.button}>Logout</button>
                    </div>

                    <div style={styles.form}>
                        <h3>Create Order</h3>
                        <form onSubmit={createOrder}>
                            <input name="product" placeholder="Product Name" required style={styles.input} />
                            <input name="quantity" type="number" placeholder="Quantity" min="1" required style={styles.input} />
                            <input name="price" type="number" step="0.01" placeholder="Price ($)" min="0.01" required style={styles.input} />
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Creating Order...' : 'Create Order'}
                            </button>
                        </form>
                    </div>

                    <div style={styles.form}>
                        <h3>Your Orders ({orders.length})</h3>
                        <button onClick={loadOrders} style={styles.button}>Refresh Orders</button>
                        
                        {orders.length === 0 ? (
                            <p>No orders yet. Create your first order above!</p>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} style={styles.orderCard}>
                                    <strong>Order #{order.id}</strong><br/>
                                    Product: {order.product_name}<br/>
                                    Quantity: {order.quantity}<br/>
                                    Price: ${order.price}<br/>
                                    Total: ${order.total_price}<br/>
                                    Status: {order.status}<br/>
                                    Date: {new Date(order.created_at).toLocaleDateString()}<br/>
                                    <button 
                                        onClick={() => processPayment(order.id, order.total_price)}
                                        style={{...styles.button, marginTop: '10px', backgroundColor: '#28a745'}}
                                        disabled={loading}
                                    >
                                        Pay ${order.total_price}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            <div style={styles.form}>
                <h3>Service Status</h3>
                <p>Frontend: ✅ Running</p>
                <p>Check other services: <a href="http://localhost:8080/health" target="_blank" rel="noopener noreferrer">API Gateway Health</a></p>
            </div>
        </div>
    );
}

export default App;
