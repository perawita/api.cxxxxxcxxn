const mysql = require('mysql2/promise'); // Gunakan mysql2 dengan Promise
const config = require('./env');

const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    waitForConnections: true,  // Menunggu koneksi jika pool penuh
    connectionLimit: 10,       // Maksimum 10 koneksi dalam pool
    queueLimit: 0              // Tidak membatasi antrean koneksi
});

// Cek koneksi hanya saat aplikasi pertama kali dijalankan
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Keluar dari aplikasi jika gagal terhubung
    }
})();

module.exports = pool;
