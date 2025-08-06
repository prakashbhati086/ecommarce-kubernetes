from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os

app = Flask(__name__)
CORS(app)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('users.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'user-service'}), 200

@app.route('/api/users/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Hash password
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        conn = sqlite3.connect('users.db')
        conn.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    (username, email, hashed_password))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409

@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    conn = sqlite3.connect('users.db')
    cursor = conn.execute('SELECT id, username, email FROM users WHERE username=? AND password=?',
                         (username, hashed_password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({'message': 'Login successful', 'user_id': user[0], 'username': user[1]}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = sqlite3.connect('users.db')
    cursor = conn.execute('SELECT id, username, email FROM users WHERE id=?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({'id': user[0], 'username': user[1], 'email': user[2]}), 200
    else:
        return jsonify({'error': 'User not found'}), 404

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5001, debug=True)
