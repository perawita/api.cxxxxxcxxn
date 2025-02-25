const db = require('../config/database');

const ApiKeyModel = {
    checkApiKey: (apiKey, callback) => {
        const sql = 'SELECT * FROM api_keys WHERE api_key = ?';
        db.query(sql, [apiKey], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.length > 0 ? results[0] : null);
        });
    },

    createApiKey: (userId, apiKey, callback) => {
        const sql = 'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)';
        db.query(sql, [userId, apiKey], (err, result) => {
            if (err) return callback(err, null);
            callback(null, { id: result.insertId, user_id: userId, api_key: apiKey });
        });
    },

    deleteApiKey: (id, callback) => {
        const sql = 'DELETE FROM api_keys WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result.affectedRows > 0);
        });
    },

    // Ambil semua API Key milik user tertentu
    getUserApiKeys: (userId, callback) => {
        const sql = 'SELECT * FROM api_keys WHERE user_id = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }
};

module.exports = ApiKeyModel;
