const db = require('../config/database');
const redis = require('../config/redis'); // Pastikan Anda memiliki konfigurasi Redis

const ApiKeyModel = {
    checkApiKey: (apiKey, callback) => {
        const redisKey = `api_key:${apiKey}`;
        
        redis.get(redisKey, (err, cachedData) => {
            if (err) return callback(err, null);
            if (cachedData) {
                return callback(null, JSON.parse(cachedData));
            }
            
            const sql = 'SELECT * FROM api_keys WHERE api_key = ?';
            db.query(sql, [apiKey], (err, results) => {
                if (err) return callback(err, null);
                const result = results.length > 0 ? results[0] : null;
                if (result) {
                    redis.setex(redisKey, 3600, JSON.stringify(result)); // Cache selama 1 jam
                }
                callback(null, result);
            });
        });
    },

    createApiKey: (userId, apiKey, callback) => {
        const sql = 'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)';
        db.query(sql, [userId, apiKey], (err, result) => {
            if (err) return callback(err, null);
            const newKey = { id: result.insertId, user_id: userId, api_key: apiKey };
            redis.setex(`api_key:${apiKey}`, 3600, JSON.stringify(newKey)); // Cache key baru
            callback(null, newKey);
        });
    },

    deleteApiKey: (id, callback) => {
        const sql = 'DELETE FROM api_keys WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return callback(err, null);
            if (result.affectedRows > 0) {
                redis.keys('api_key:*', (err, keys) => {
                    if (!err && keys.length > 0) {
                        redis.del(...keys); // Hapus semua cache terkait API keys
                    }
                });
            }
            callback(null, result.affectedRows > 0);
        });
    },

    getUserApiKeys: (userId, callback) => {
        const redisKey = `user_api_keys:${userId}`;
        
        redis.get(redisKey, (err, cachedData) => {
            if (err) return callback(err, null);
            if (cachedData) {
                return callback(null, JSON.parse(cachedData));
            }
            
            const sql = 'SELECT * FROM api_keys WHERE user_id = ?';
            db.query(sql, [userId], (err, results) => {
                if (err) return callback(err, null);
                redis.setex(redisKey, 3600, JSON.stringify(results)); // Cache hasil selama 1 jam
                callback(null, results);
            });
        });
    }
};

module.exports = ApiKeyModel;