const db = require('../config/database');
const redisClient = require('../config/redis');

const ApiKeyModel = {
    checkApiKey: async (apiKey) => {
        try {
            const cacheKey = `api_key:${apiKey}`;
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            const [results] = await db.execute('SELECT * FROM api_keys WHERE api_key = ?', [apiKey]);
            if (results.length > 0) {
                await redisClient.setEx(cacheKey, 600, JSON.stringify(results[0])); // Cache 10 menit
                return results[0];
            }
            return null;
        } catch (error) {
            throw error;
        }
    },

    createApiKey: async (userId, apiKey) => {
        try {
            const [result] = await db.execute(
                'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)', [userId, apiKey]
            );
            const newApiKey = { id: result.insertId, user_id: userId, api_key };

            await redisClient.setEx(`api_key:${apiKey}`, 600, JSON.stringify(newApiKey));
            await redisClient.del(`user_api_keys:${userId}`);
            return newApiKey;
        } catch (error) {
            throw error;
        }
    },

    deleteApiKey: async (id) => {
        try {
            const [results] = await db.execute('SELECT api_key, user_id FROM api_keys WHERE id = ?', [id]);
            if (results.length === 0) return false;

            const { api_key, user_id } = results[0];
            const [result] = await db.execute('DELETE FROM api_keys WHERE id = ?', [id]);

            if (result.affectedRows > 0) {
                await redisClient.del(`api_key:${api_key}`);
                await redisClient.del(`user_api_keys:${user_id}`);
            }
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    getUserApiKeys: async (userId) => {
        try {
            const cacheKey = `user_api_keys:${userId}`;
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            const [results] = await db.execute('SELECT * FROM api_keys WHERE user_id = ?', [userId]);
            await redisClient.setEx(cacheKey, 600, JSON.stringify(results)); // Cache 10 menit
            return results;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = ApiKeyModel;
