const mysql = require('mysql');
const config = require('./env');

const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to database');
    connection.release(); 
});

module.exports = pool;
