const db = require('../config/database');
const redisClient = require('../config/redis');

const AkrabModel = {
    getAll: async (keyAccess) => {
        try {
            const cacheKey = `akrab_all:${keyAccess}`;
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            const [results] = await db.query("SELECT * FROM akrab WHERE key_access = ?", [keyAccess]);
            await redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            return results;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getById: async (id, keyAccess) => {
        try {
            const cacheKey = `akrab:${id}:${keyAccess}`;
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            const [results] = await db.query("SELECT * FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess]);
            if (results.length > 0) {
                await redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            }
            return results;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    create: async (data, keyAccess) => {
        try {
            const query = "INSERT INTO akrab (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access, quota_allocated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, keyAccess, data.quota_allocated];
            
            const [result] = await db.query(query, values);
            await redisClient.del(`akrab_all:${keyAccess}`);
            return { insertId: result.insertId };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    update: async (id, data, keyAccess) => {
        try {
            const [existingData] = await db.query("SELECT key_access FROM akrab WHERE id = ?", [id]);
            if (existingData.length === 0) return { status: 404, message: "Data not found" };
            if (existingData[0].key_access !== keyAccess) return { status: 403, message: "Forbidden: Invalid key_access" };

            const query = "UPDATE akrab SET id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, sisa_slot=?, jumlah_slot=?, slot_terpakai=?, quota_allocated=? WHERE id=? AND key_access=?";
            const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, data.quota_allocated, id, keyAccess];
            
            await db.query(query, values);
            await Promise.all([
                redisClient.del(`akrab:${id}:${keyAccess}`),
                redisClient.del(`akrab_all:${keyAccess}`)
            ]);
            
            return { status: 200, message: "Data updated successfully" };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    delete: async (id, keyAccess) => {
        try {
            const [existingData] = await db.query("SELECT key_access FROM akrab WHERE id = ?", [id]);
            if (existingData.length === 0) return { status: 404, message: "Data not found" };
            if (existingData[0].key_access !== keyAccess) return { status: 403, message: "Forbidden: Invalid key_access" };

            await db.query("DELETE FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess]);
            await Promise.all([
                redisClient.del(`akrab:${id}:${keyAccess}`),
                redisClient.del(`akrab_all:${keyAccess}`)
            ]);
            
            return { status: 200, message: "Data deleted successfully" };
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = AkrabModel;