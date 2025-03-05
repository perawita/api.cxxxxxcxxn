const db = require('../config/database');
const redisClient = require('../config/redis');

const ApiKeyModel = {
    checkApiKey: async (apiKey, callback) => {
        try {
            const cacheKey = `api_key:${apiKey}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                return callback(null, JSON.parse(cachedData));
            }

            const sql = 'SELECT * FROM api_keys WHERE api_key = ?';
            db.query(sql, [apiKey], (err, results) => {
                if (err) return callback(err, null);

                if (results.length > 0) {
                    redisClient.setEx(cacheKey, 600, JSON.stringify(results[0])); // Simpan 10 menit
                    return callback(null, results[0]);
                }

                callback(null, null);
            });
        } catch (error) {
            callback(error, null);
        }
    },

    createApiKey: (userId, apiKey, callback) => {
        const sql = 'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)';
        db.query(sql, [userId, apiKey], (err, result) => {
            if (err) return callback(err, null);

            const newApiKey = { id: result.insertId, user_id: userId, api_key: apiKey };

            // Cache API key yang baru dibuat
            redisClient.setEx(`api_key:${apiKey}`, 600, JSON.stringify(newApiKey));

            // Hapus cache daftar API key user terkait agar data tetap akurat
            redisClient.del(`user_api_keys:${userId}`);

            callback(null, newApiKey);
        });
    },

    deleteApiKey: (id, callback) => {
        // Ambil API key sebelum dihapus agar bisa menghapus cache-nya juga
        const sqlSelect = 'SELECT api_key, user_id FROM api_keys WHERE id = ?';
        db.query(sqlSelect, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, false);

            const { api_key, user_id } = results[0];

            const sqlDelete = 'DELETE FROM api_keys WHERE id = ?';
            db.query(sqlDelete, [id], (err, result) => {
                if (err) return callback(err, null);
                
                if (result.affectedRows > 0) {
                    // Hapus cache terkait API key yang dihapus
                    redisClient.del(`api_key:${api_key}`);
                    redisClient.del(`user_api_keys:${user_id}`);
                }

                callback(null, result.affectedRows > 0);
            });
        });
    },

    getUserApiKeys: async (userId, callback) => {
        try {
            const cacheKey = `user_api_keys:${userId}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                return callback(null, JSON.parse(cachedData));
            }

            const sql = 'SELECT * FROM api_keys WHERE user_id = ?';
            db.query(sql, [userId], (err, results) => {
                if (err) return callback(err, null);

                redisClient.setEx(cacheKey, 600, JSON.stringify(results)); // Simpan selama 10 menit

                callback(null, results);
            });
        } catch (error) {
            callback(error, null);
        }
    }
};

module.exports = ApiKeyModel;
