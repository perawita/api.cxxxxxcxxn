const db = require('../config/database');
const redisClient = require('../config/redis');

const AkrabModel = {
    getAll: async (keyAccess) => {
        try {
            const cacheKey = `akrab_all:${keyAccess}`;
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            const [results] = await db.execute("SELECT * FROM akrab WHERE key_access = ?", [keyAccess]);
            await redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            return results;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id, keyAccess) => {
        try {
            const cacheKey = `akrab:${id}:${keyAccess}`;
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            const [results] = await db.execute("SELECT * FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess]);
            if (results.length === 0) return null;

            if (results[0].sisa_slot <= 0) await redisClient.del(cacheKey);

            await redisClient.setEx(cacheKey, 600, JSON.stringify(results[0]));
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    create: async (data, keyAccess) => {
        try {
            const query = `
                INSERT INTO akrab (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access, quota_allocated) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                data.id_produk, data.nama_paket, data.harga, data.stok, 
                data.Original_Price, data.sisa_slot, data.jumlah_slot, 
                data.slot_terpakai, keyAccess, data.quota_allocated
            ];

            const [result] = await db.execute(query, values);
            await redisClient.del(`akrab_all:${keyAccess}`);
            return { id: result.insertId, ...data, keyAccess };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, data, keyAccess) => {
        try {
            const [results] = await db.execute("SELECT key_access FROM akrab WHERE id = ?", [id]);
            if (results.length === 0) return { status: 404, message: "Data not found" };

            if (results[0].key_access !== keyAccess) return { status: 403, message: "Forbidden: Invalid key_access" };

            const query = `
                UPDATE akrab 
                SET id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, sisa_slot=?, jumlah_slot=?, slot_terpakai=?, quota_allocated=? 
                WHERE id=? AND key_access=?`;
            const values = [
                data.id_produk, data.nama_paket, data.harga, data.stok, 
                data.Original_Price, data.sisa_slot, data.jumlah_slot, 
                data.slot_terpakai, data.quota_allocated, id, keyAccess
            ];

            const [result] = await db.execute(query, values);
            if (result.affectedRows > 0) {
                await redisClient.del(`akrab:${id}:${keyAccess}`);
                await redisClient.del(`akrab_all:${keyAccess}`);
                return { status: 200, message: "Data updated successfully" };
            }

            return { status: 400, message: "No changes applied" };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id, keyAccess) => {
        try {
            const [results] = await db.execute("SELECT key_access FROM akrab WHERE id = ?", [id]);
            if (results.length === 0) return { status: 404, message: "Data not found" };

            if (results[0].key_access !== keyAccess) return { status: 403, message: "Forbidden: Invalid key_access" };

            const [result] = await db.execute("DELETE FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess]);
            if (result.affectedRows > 0) {
                await redisClient.del(`akrab:${id}:${keyAccess}`);
                await redisClient.del(`akrab_all:${keyAccess}`);
                return { status: 200, message: "Data deleted successfully" };
            }

            return { status: 400, message: "Deletion failed" };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = AkrabModel;
