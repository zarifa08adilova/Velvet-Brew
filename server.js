const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
console.log("Config loaded:", config);

app.get('/api/v1/config', (req, res) => {
    const currentConfig = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    res.json(currentConfig);
});

app.post('/api/v1/config', (req, res) => {
    const newConfig = req.body;
    fs.writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
    res.json({ message: "Config updated!", config: newConfig });
});

const db = new sqlite3.Database('./library.db');

db.run(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    year INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coffee TEXT,
    customer TEXT,
    quantity INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get('/api/v1/data', (req, res) => {
    const sql = `SELECT * FROM books`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "success", data: rows });
    });
});

app.post('/api/v1/data', (req, res) => {
    const { title, author, year } = req.body;
    const sql = `INSERT INTO books (title, author, year) VALUES (?, ?, ?)`;

    db.run(sql, [title, author, year], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Kitab əlavə olundu", id: this.lastID });
    });
});

app.put('/api/v1/data/:id', (req, res) => {
    const { title, author, year } = req.body;
    const { id } = req.params;

    db.run(`UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?`,
        [title, author, year, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Kitab yeniləndi!", changes: this.changes });
        });
});

app.delete('/api/v1/data/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM books WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Kitab silindi!", changes: this.changes });
    });
});

app.get('/api/v1/orders', (req, res) => {
    db.all(`SELECT * FROM orders`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "success", data: rows });
    });
});

app.post('/api/v1/orders', (req, res) => {
    const { coffee, customer, quantity } = req.body;
    const sql = `INSERT INTO orders (coffee, customer, quantity) VALUES (?, ?, ?)`;

    db.run(sql, [coffee, customer, quantity], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Order placed!", id: this.lastID });
    });
});

app.put('/api/v1/orders/:id', (req, res) => {
    const { coffee, customer, quantity } = req.body;
    const { id } = req.params;

    db.run(`UPDATE orders SET coffee = ?, customer = ?, quantity = ? WHERE id = ?`,
        [coffee, customer, quantity, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Order updated!", changes: this.changes });
        });
});

app.delete('/api/v1/orders/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM orders WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Order deleted!", changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server işləyir: http://localhost:${PORT}`);
});