const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./app/config/env');
const akrabRoute = require('./app/routes/akrabRoute');
const propertiRoute = require('./app/routes/propertiRoute');
const checkHeader = require('./app/middleware/checkHeader');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-user-id'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug: Log setiap request masuk
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Endpoint utama
app.get('/', (req, res) => {
    console.log('Akses ke endpoint utama /');
    res.status(200).json({
        status: true,
        message: 'Ooooh Hai 🖐'
    });
});

// Debug: Middleware pengecekan header
app.use((req, res, next) => {
    console.log('Middleware umum: Cek header');
    console.log('Headers:', req.headers);
    next();
});

// Routes
app.use('/api/v1/properti', checkHeader, (req, res, next) => {
    console.log('Request masuk ke /api/v1/properti');
    next();
}, propertiRoute);

app.use('/api/v1/akrab', checkHeader, (req, res, next) => {
    console.log('Request masuk ke /api/v1/akrab');
    next();
}, akrabRoute);

// Debug: Handle Routes not found
app.use((req, res) => {
    console.log(`404 - Route tidak ditemukan: ${req.method} ${req.url}`);
    res.status(404).json({
        status: false,
        message: 'Route not found'
    });
});

// Debug: Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error Middleware:', err);
    res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// Jalankan server
app.listen(config.port, () => {
    console.log(`Server ${config.app} running on port ${config.port}`);
});
