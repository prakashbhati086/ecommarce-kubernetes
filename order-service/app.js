const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database('./orders.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'order-service' });
});

app.post('/api/orders', async (req, res) => {
    const { user_id, product_name, quantity, price } = req.body;
    
    if (!user_id || !product_name || !quantity || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const total_price = quantity * price;
    
    // Verify user exists (call user service)
    try {
        
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:5001';
await axios.get(`${userServiceUrl}/api/users/${user_id}`);

    } catch (error) {
        return res.status(400).json({ error: 'Invalid user_id' });
    }
    
    db.run('INSERT INTO orders (user_id, product_name, quantity, total_price) VALUES (?, ?, ?, ?)',
        [user_id, product_name, quantity, total_price],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ 
                message: 'Order created successfully', 
                order_id: this.lastID,
                total_price: total_price
            });
        }
    );
});

app.get('/api/orders/user/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    
    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', 
        [user_id], 
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ orders: rows });
        }
    );
});

app.get('/api/orders/:order_id', (req, res) => {
    const order_id = req.params.order_id;
    
    db.get('SELECT * FROM orders WHERE id = ?', [order_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(row);
    });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});

