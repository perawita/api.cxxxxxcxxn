const db = require('../config/database');
const redisClient = require('../config/redis');
const { promisify } = require('util');

// Promisify Redis functions
const getAsync = promisify(redisClient.get).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

const AkrabModel = {
    getAll: async (keyAccess) => {
        const cacheKey = `akrab_all:${keyAccess}`;
        const cachedData = await getAsync(cacheKey);

        if (cachedData) return JSON.parse(cachedData);

        const [results] = await db.promise().query("SELECT * FROM akrab WHERE key_access = ?", [keyAccess]);
        
        if (results.length > 0) {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(results));
        }

        return results;
    },

    getById: async (id, keyAccess) => {
        const cacheKey = `akrab:${id}:${keyAccess}`;
        const cachedData = await getAsync(cacheKey);
    
        if (cachedData) return JSON.parse(cachedData);
    
        const [results] = await db.promise().query("SELECT * FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess]);
    
        if (results.length > 0) {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(results[0]));
        }
    
        return results.length > 0 ? results[0] : null;
    },    

    create: async (data, keyAccess) => {
        const query = "INSERT INTO akrab (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access, quota_allocated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, keyAccess, data.quota_allocated];

        const [result] = await db.promise().query(query, values);
        
        await delAsync(`akrab_all:${keyAccess}`);
        
        return { id: result.insertId, ...data, key_access: keyAccess };
    },

    update: async (id, data, keyAccess) => {
        const [results] = await db.promise().query("SELECT key_access FROM akrab WHERE id = ?", [id]);
        
        if (results.length === 0) return { status: 404, message: "Data not found" };
        if (results[0].key_access !== keyAccess) return { status: 403, message: "Forbidden: Invalid key_access" };

        const updateQuery = "UPDATE akrab SET id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, sisa_slot=?, jumlah_slot=?, slot_terpakai=?, quota_allocated=? WHERE id=? AND key_access=?";
        const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, data.quota_allocated, id, keyAccess];

        await db.promise().query(updateQuery, values);
        
        await Promise.all([
            delAsync(`akrab:${id}:${keyAccess}`),
            delAsync(`akrab_all:${keyAccess}`)
        ]);

        return { status: 200, message: "Data updated successfully" };
    },

    delete: async (id, keyAccess) => {
        const [results] = await db.promise().query("SELECT key_access FROM akrab WHERE id = ?", [id]);
        
        if (results.length === 0) return { status: 404, message: "Data not found" };
        if (results[0].key_access !== keyAccess) return { status: 403, message: "Forbidden: Invalid key_access" };

        await db.promise().query("DELETE FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess]);
        
        await Promise.all([
            delAsync(`akrab:${id}:${keyAccess}`),
            delAsync(`akrab_all:${keyAccess}`)
        ]);
        
        return { status: 200, message: "Data deleted successfully" };
    }
};

module.exports = AkrabModel;
