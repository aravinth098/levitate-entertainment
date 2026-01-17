const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// --- MIDDLEWARE ---
app.use(cors());
// Increased limit to 50mb because you are now uploading TWO images (Poster + Banner)
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Your MySQL username
    password: 'aravinth', // Your MySQL password
    database: 'levitate_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.code);
    } else {
        console.log("✅ Connected to MySQL Database: levitate_db");
        connection.release();
    }
});

// --- ROUTES ---

// 1. GET ALL EVENTS (Ordered by Date)
app.get('/api/events', (req, res) => {
    const sql = "SELECT * FROM events ORDER BY created_at DESC"; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch events" });
        }
        res.json(result);
    });
});

// 2. ADD NEW EVENT (Updated to include banner_url)
app.post('/api/events', (req, res) => {
    // Admin Password Check
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== 'levitateAdmin') {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { 
        title, 
        date, 
        category, 
        img_url, 
        banner_url,  // <--- NEW: Receive banner from frontend
        description, 
        is_locked,
        event_type, 
        ticket_url, 
        map_url      
    } = req.body;

    const sql = `
        INSERT INTO events 
        (title, date, category, img_url, banner_url, description, is_locked, event_type, ticket_url, map_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        title, 
        date, 
        category, 
        img_url, 
        banner_url || '', // <--- NEW: Save banner (or empty string if none)
        description, 
        is_locked ? 1 : 0,
        event_type || 'paid',
        ticket_url || '',
        map_url || ''
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Insert Error:", err);
            return res.status(500).json({ error: "Failed to save event" });
        }
        res.json({ message: "Event added successfully!", id: result.insertId });
    });
});

// 3. DELETE EVENT
app.delete('/api/events/:id', (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== 'levitateAdmin') {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const sql = "DELETE FROM events WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to delete event" });
        }
        res.json({ message: "Event deleted!" });
    });
});

// 4. TOGGLE LOCK STATUS
app.put('/api/events/:id/lock', (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== 'levitateAdmin') {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    
    db.query("SELECT is_locked FROM events WHERE id = ?", [id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({error: "Event not found"});
        
        const currentStatus = results[0].is_locked;
        const newStatus = !currentStatus;

        db.query("UPDATE events SET is_locked = ? WHERE id = ?", [newStatus, id], (err, result) => {
             if (err) return res.status(500).json({ error: "Update failed" });
             res.json({ message: "Lock status updated", isLocked: newStatus });
        });
    });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});