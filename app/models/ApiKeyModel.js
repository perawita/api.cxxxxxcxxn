const db = require('../config/database');
const redisClient = require('../config/redis'); // Import Redis

const ApiKeyModel = {
    checkApiKey: async (apiKey) => {
        const cacheKey = `api_key:${apiKey}`;

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        // Jika tidak ada di cache, ambil dari database
        const [results] = await db.promise().query(
            'SELECT * FROM api_keys WHERE api_key = ? LIMIT 1', 
            [apiKey]
        );

        if (results.length > 0) {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(results[0]));
        }

        return results.length > 0 ? results[0] : null;
    },

    createApiKey: async (userId, apiKey) => {
        const [result] = await db.promise().query(
            'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)', 
            [userId, apiKey]
        );

        const newApiKey = { id: result.insertId, user_id: userId, api_key: apiKey };

        // Simpan ke Redis
        await redisClient.setEx(`api_key:${apiKey}`, 600, JSON.stringify(newApiKey));

        return newApiKey;
    },

    deleteApiKey: async (id) => {
        const [result] = await db.promise().query(
            'DELETE FROM api_keys WHERE id = ?', 
            [id]
        );

        if (result.affectedRows > 0) {
            // Hapus semua cache yang berkaitan
            await redisClient.del(`api_key:${id}`);
        }

        return result.affectedRows > 0;
    },

    getUserApiKeys: async (userId) => {
        const cacheKey = `user_api_keys:${userId}`;

        // Cek di Redis
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        // Jika tidak ada di cache, ambil dari database
        const [results] = await db.promise().query(
            'SELECT * FROM api_keys WHERE user_id = ?', 
            [userId]
        );

        if (results.length > 0) {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(results)); // Cache 10 menit
        }

        return results;
    }
};

module.exports = ApiKeyModel;
