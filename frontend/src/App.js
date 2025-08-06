import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

function App() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);

    const register = async (username, email, password) => {
        try {
            await axios.post(`${API_BASE}/users/register`, { username, email, password });
            alert('Registration successful!');
        } catch (error) {
            alert('Registration failed: ' + error.response.data.error);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE}/users/login`, { username, password });
            setUser(response.data);
            alert('Login successful!');
        } catch (error) {
            alert('Login failed: ' + error.response.data.error);
        }
    };

    const createOrder = async (productName, quantity, price) => {
        if (!user) return alert('Please login first');
        
        try {
            const response = await axios.post(`${API_BASE}/orders`, {
                user_id: user.user_id,
                product_name: productName,
                quantity,
                price
            });
            alert('Order created successfully!');
            loadOrders();
        } catch (error) {
            alert('Order creation failed');
        }
    };

    const loadOrders = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`${API_BASE}/orders/user/${user.user_id}`);
            setOrders(response.data.orders);
        } catch (error) {
            console.error('Failed to load orders');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>E-commerce Microservices App</h1>
            
            {!user ? (
                <div>
                    <h2>Register</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        register(form.username.value, form.email.value, form.password.value);
                    }}>
                        <input name="username" placeholder="Username" required /><br/>
                        <input name="email" type="email" placeholder="Email" required /><br/>
                        <input name="password" type="password" placeholder="Password" required /><br/>
                        <button type="submit">Register</button>
                    </form>

                    <h2>Login</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        login(form.username.value, form.password.value);
                    }}>
                        <input name="username" placeholder="Username" required /><br/>
                        <input name="password" type="password" placeholder="Password" required /><br/>
                        <button type="submit">Login</button>
                    </form>
                </div>
            ) : (
                <div>
                    <h2>Welcome, {user.username}!</h2>
                    <button onClick={() => setUser(null)}>Logout</button>

                    <h3>Create Order</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        createOrder(form.product.value, parseInt(form.quantity.value), parseFloat(form.price.value));
                    }}>
                        <input name="product" placeholder="Product Name" required /><br/>
                        <input name="quantity" type="number" placeholder="Quantity" required /><br/>
                        <input name="price" type="number" step="0.01" placeholder="Price" required /><br/>
                        <button type="submit">Create Order</button>
                    </form>

                    <h3>Your Orders</h3>
                    <button onClick={loadOrders}>Load Orders</button>
                    <ul>
                        {orders.map(order => (
                            <li key={order.id}>
                                {order.product_name} - Qty: {order.quantity} - ${order.total_price}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
