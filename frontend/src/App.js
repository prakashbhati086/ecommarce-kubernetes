import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

// Sample product data (later you can fetch from API)
const SAMPLE_PRODUCTS = [
    { id: 1, name: "iPhone 15 Pro", price: 999.99, image: "📱", description: "Latest iPhone with advanced features", category: "Electronics" },
    { id: 2, name: "MacBook Air M2", price: 1199.99, image: "💻", description: "Powerful laptop for professionals", category: "Electronics" },
    { id: 3, name: "AirPods Pro", price: 249.99, image: "🎧", description: "Premium wireless headphones", category: "Electronics" },
    { id: 4, name: "Nike Air Max", price: 129.99, image: "👟", description: "Comfortable running shoes", category: "Fashion" },
    { id: 5, name: "Samsung 4K TV", price: 799.99, image: "📺", description: "Ultra HD Smart TV", category: "Electronics" },
    { id: 6, name: "Coffee Maker", price: 89.99, image: "☕", description: "Premium coffee brewing machine", category: "Home" },
];

function App() {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const showMessage = (msg, isError = false) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const filteredProducts = SAMPLE_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        if (!user) {
            showMessage('Please sign in to add items to cart', true);
            setCurrentPage('auth');
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        showMessage(`${product.name} added to cart!`);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
        showMessage('Item removed from cart');
    };

    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item =>
            item.id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
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
            showMessage('Registration successful! Please sign in.');
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
            showMessage('Welcome back!');
            setCurrentPage('home');
            form.reset();
        } catch (error) {
            showMessage(`Login failed: ${error.response?.data?.error || error.message}`, true);
        }
        setLoading(false);
    };

    const processCheckout = async () => {
        if (cart.length === 0) {
            showMessage('Your cart is empty!', true);
            return;
        }

        setLoading(true);
        try {
            // Create orders for each cart item
            for (const item of cart) {
                await axios.post(`${API_BASE}/orders`, {
                    user_id: user.user_id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price
                });
            }

            // Process payment for total amount
            const totalAmount = getCartTotal();
            const paymentResponse = await axios.post(`${API_BASE}/payments/process`, {
                order_id: `cart_${Date.now()}`,
                amount: parseFloat(totalAmount),
                card_number: '1234567890123456' // Demo card
            });

            if (paymentResponse.data.status === 'success') {
                showMessage(`Payment successful! Transaction: ${paymentResponse.data.transaction_id}`);
                setCart([]); // Empty cart
                loadOrders();
                setCurrentPage('orders');
            } else {
                showMessage('Payment failed!', true);
            }
        } catch (error) {
            showMessage(`Checkout failed: ${error.response?.data?.error || error.message}`, true);
        }
        setLoading(false);
    };

    const buyNow = (product) => {
        if (!user) {
            showMessage('Please sign in to purchase items', true);
            setCurrentPage('auth');
            return;
        }
        setCart([{ ...product, quantity: 1 }]);
        setCurrentPage('checkout');
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

    const logout = () => {
        setUser(null);
        setCart([]);
        setOrders([]);
        setCurrentPage('home');
        showMessage('Logged out successfully!');
    };

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const styles = {
        container: { fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '2px solid #007bff', marginBottom: '20px' },
        logo: { fontSize: '24px', fontWeight: 'bold', color: '#007bff' },
        nav: { display: 'flex', gap: '20px' },
        navButton: { padding: '8px 16px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
        activeNav: { backgroundColor: '#007bff', color: 'white' },
        message: { padding: '10px', margin: '10px 0', borderRadius: '4px', backgroundColor: message.includes('failed') || message.includes('Failed') ? '#f8d7da' : '#d4edda' },
        productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', margin: '20px 0' },
        productCard: { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
        productImage: { fontSize: '48px', marginBottom: '10px' },
        button: { padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: '5px' },
        secondaryButton: { backgroundColor: '#6c757d' },
        successButton: { backgroundColor: '#28a745' },
        input: { display: 'block', width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '4px' },
        form: { maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
        cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', margin: '10px 0', borderRadius: '4px' },
        searchBox: { width: '300px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
    };

    const renderHeader = () => (
        <div style={styles.header}>
            <div style={styles.logo}>🛍️ ShopEasy - Microservices Store</div>
            <div style={styles.nav}>
                <button 
                    style={{...styles.navButton, ...(currentPage === 'home' ? styles.activeNav : {})}}
                    onClick={() => setCurrentPage('home')}
                >
                    Home
                </button>
                <button 
                    style={{...styles.navButton, ...(currentPage === 'cart' ? styles.activeNav : {})}}
                    onClick={() => setCurrentPage('cart')}
                >
                    Cart ({getCartItemCount()})
                </button>
                {user ? (
                    <>
                        <button 
                            style={{...styles.navButton, ...(currentPage === 'orders' ? styles.activeNav : {})}}
                            onClick={() => {setCurrentPage('orders'); loadOrders();}}
                        >
                            My Orders
                        </button>
                        <span>Welcome, {user.username}</span>
                        <button style={styles.navButton} onClick={logout}>Logout</button>
                    </>
                ) : (
                    <button 
                        style={{...styles.navButton, ...(currentPage === 'auth' ? styles.activeNav : {})}}
                        onClick={() => setCurrentPage('auth')}
                    >
                        Sign In
                    </button>
                )}
            </div>
        </div>
    );

    const renderHome = () => (
        <div>
            <div style={{textAlign: 'center', margin: '20px 0'}}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchBox}
                />
            </div>
            
            <h2>Featured Products</h2>
            <div style={styles.productGrid}>
                {filteredProducts.map(product => (
                    <div key={product.id} style={styles.productCard}>
                        <div style={styles.productImage}>{product.image}</div>
                        <h3>{product.name}</h3>
                        <p style={{color: '#666', fontSize: '14px'}}>{product.description}</p>
                        <p style={{fontSize: '18px', fontWeight: 'bold', color: '#007bff'}}>${product.price}</p>
                        <div>
                            <button 
                                style={styles.button} 
                                onClick={() => addToCart(product)}
                                disabled={loading}
                            >
                                Add to Cart
                            </button>
                            <button 
                                style={{...styles.button, ...styles.successButton}} 
                                onClick={() => buyNow(product)}
                                disabled={loading}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAuth = () => (
        <div>
            <div style={styles.form}>
                <h2>Sign Up</h2>
                <form onSubmit={register}>
                    <input name="username" placeholder="Username" required style={styles.input} />
                    <input name="email" type="email" placeholder="Email" required style={styles.input} />
                    <input name="password" type="password" placeholder="Password" required style={styles.input} />
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
            </div>

            <div style={styles.form}>
                <h2>Sign In</h2>
                <form onSubmit={login}>
                    <input name="username" placeholder="Username" required style={styles.input} />
                    <input name="password" type="password" placeholder="Password" required style={styles.input} />
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderCart = () => (
        <div>
            <h2>Shopping Cart</h2>
            {cart.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px'}}>
                    <p>Your cart is empty</p>
                    <button style={styles.button} onClick={() => setCurrentPage('home')}>
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div>
                    {cart.map(item => (
                        <div key={item.id} style={styles.cartItem}>
                            <div>
                                <span style={{fontSize: '24px', marginRight: '10px'}}>{item.image}</span>
                                <strong>{item.name}</strong>
                                <p style={{color: '#666', margin: '5px 0'}}>${item.price} each</p>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <button 
                                    style={styles.button}
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button 
                                    style={styles.button}
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                >
                                    +
                                </button>
                                <span style={{marginLeft: '20px', fontWeight: 'bold'}}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button 
                                    style={{...styles.button, backgroundColor: '#dc3545'}}
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div style={{textAlign: 'right', margin: '20px 0', fontSize: '18px'}}>
                        <strong>Total: ${getCartTotal()}</strong>
                    </div>
                    
                    <div style={{textAlign: 'center'}}>
                        <button 
                            style={{...styles.button, fontSize: '16px', padding: '12px 24px'}}
                            onClick={() => setCurrentPage('checkout')}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderCheckout = () => (
        <div>
            <h2>Checkout</h2>
            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px'}}>
                <div>
                    <h3>Order Summary</h3>
                    {cart.map(item => (
                        <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee'}}>
                            <span>{item.image} {item.name} (×{item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid #007bff'}}>
                        <span>Total</span>
                        <span>${getCartTotal()}</span>
                    </div>
                </div>
                
                <div style={styles.form}>
                    <h3>Payment Information</h3>
                    <p style={{color: '#666', fontSize: '14px'}}>Demo: This will process a test payment</p>
                    <button 
                        style={{...styles.button, width: '100%', fontSize: '16px', padding: '12px'}}
                        onClick={processCheckout}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Pay $${getCartTotal()}`}
                    </button>
                    <button 
                        style={{...styles.button, ...styles.secondaryButton, width: '100%', marginTop: '10px'}}
                        onClick={() => setCurrentPage('cart')}
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div>
            <h2>Order History</h2>
            {orders.length === 0 ? (
                <p>No orders yet. Start shopping!</p>
            ) : (
                <div>
                    {orders.map(order => (
                        <div key={order.id} style={{...styles.cartItem, flexDirection: 'column', alignItems: 'stretch'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                <strong>Order #{order.id}</strong>
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <p><strong>Product:</strong> {order.product_name}</p>
                                <p><strong>Quantity:</strong> {order.quantity}</p>
                                <p><strong>Total:</strong> ${order.total_price}</p>
                                <p><strong>Status:</strong> {order.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div style={styles.container}>
            {renderHeader()}
            
            {message && <div style={styles.message}>{message}</div>}
            
            {currentPage === 'home' && renderHome()}
            {currentPage === 'auth' && renderAuth()}
            {currentPage === 'cart' && renderCart()}
            {currentPage === 'checkout' && renderCheckout()}
            {currentPage === 'orders' && renderOrders()}
        </div>
    );
}

export default App;
