const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant_db',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// GET all restaurants
app.get('/restaurants', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM restaurant');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Simple recommender: filter by cuisine, city, min_rating
app.get('/recommend', async (req, res) => {
  const { cuisine, city, min_rating } = req.query;

  let sql = 'SELECT * FROM restaurant WHERE 1=1';
  const params = [];

  if (cuisine) {
    sql += ' AND cuisine LIKE ?';
    params.push(`%${cuisine}%`);
  }
  if (city) {
    sql += ' AND city LIKE ?';
    params.push(`%${city}%`);
  }
  if (min_rating) {
    sql += ' AND rating >= ?';
    params.push(Number(min_rating));
  }

  sql += ' ORDER BY rating DESC';

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
