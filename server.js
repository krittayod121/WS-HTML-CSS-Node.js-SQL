const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const path = require('path');
const port = 3001; // ตั้งค่าพอร์ตที่นี่

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// สร้างฐานข้อมูลและตาราง
const db = new sqlite3.Database('mydatabase.db');

// สร้างตารางหากยังไม่มี
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT)');
});

// การแทรกข้อมูลลงในตาราง users
db.run('INSERT INTO users (email, password) VALUES (?, ?)', ['user@example.com', 'password123'], function(err) {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
});

// การดึงข้อมูลจากตาราง users
db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log(rows);
});

// การอัปเดตข้อมูลในตาราง users
db.run('UPDATE users SET password = ? WHERE email = ?', ['newpassword456', 'user@example.com'], function(err) {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log(`Rows updated: ${this.changes}`);
});

// การลบข้อมูลจากตาราง users
db.run('DELETE FROM users WHERE email = ?', 'user@example.com', function(err) {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log(`Rows deleted: ${this.changes}`);
});

// เส้นทางของ API ต่าง ๆ
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/todos', (req, res) => {
    const { task } = req.body;
    db.run('INSERT INTO todos (task) VALUES (?)', [task], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, task });
    });
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    db.run('UPDATE todos SET task = ? WHERE id = ?', [task, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id, task });
    });
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM todos WHERE id = ?', id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id });
    });
});

// เส้นทางสำหรับการลงทะเบียนผู้ใช้
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, email });
    });
});

// เริ่มฟังการเชื่อมต่อ
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
