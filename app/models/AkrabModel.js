const db = require('../config/database');
const redisClient = require('../config/redis');

const AkrabModel = {
    getAll: async (keyAccess, callback) => {
        try {
            const cacheKey = `akrab_all:${keyAccess}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                return callback(null, JSON.parse(cachedData));
            }

            db.query("SELECT * FROM akrab WHERE key_access = ?", [keyAccess], (err, results) => {
                if (err) return callback(err, null);

                if (!results || results.length === 0) {
                    return callback(null, []);
                }

                redisClient.setEx(cacheKey, 600, JSON.stringify(results));
                return callback(null, results);
            });
        } catch (error) {
            return callback(error, null);
        }
    },

    getById: async (id, keyAccess, callback) => {
        try {
            const cacheKey = `akrab:${id}:${keyAccess}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                return callback(null, JSON.parse(cachedData));
            }

            db.query("SELECT * FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess], (err, results) => {
                if (err) return callback(err, null);

                if (!results || results.length === 0) {
                    return callback(null, { status: 404, message: "Data not found" });
                }

                redisClient.setEx(cacheKey, 600, JSON.stringify(results[0]));
                return callback(null, results[0]);
            });
        } catch (error) {
            return callback(error, null);
        }
    },

    create: (data, keyAccess, callback) => {
        const query = `INSERT INTO akrab 
            (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access, quota_allocated) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            data.id_produk, data.nama_paket, data.harga, data.stok,
            data.Original_Price, data.sisa_slot, data.jumlah_slot, 
            data.slot_terpakai, keyAccess, data.quota_allocated
        ];

        db.query(query, values, (err, result) => {
            if (err) return callback(err, null);

            redisClient.del(`akrab_all:${keyAccess}`);
            return callback(null, { status: 201, message: "Data created successfully", result });
        });
    },

    update: (id, data, keyAccess, callback) => {
        db.query("SELECT key_access FROM akrab WHERE id = ?", [id], (err, results) => {
            if (err) return callback(err, null);
            if (!results || results.length === 0) {
                return callback(null, { status: 404, message: "Data not found" });
            }
            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }

            const updateQuery = `UPDATE akrab SET 
                id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, 
                sisa_slot=?, jumlah_slot=?, slot_terpakai=?, quota_allocated=? 
                WHERE id=? AND key_access=?`;

            const values = [
                data.id_produk, data.nama_paket, data.harga, data.stok, 
                data.Original_Price, data.sisa_slot, data.jumlah_slot, 
                data.slot_terpakai, data.quota_allocated, id, keyAccess
            ];

            db.query(updateQuery, values, (updateErr, result) => {
                if (updateErr) return callback(updateErr, null);

                redisClient.del(`akrab:${id}:${keyAccess}`);
                redisClient.del(`akrab_all:${keyAccess}`);

                return callback(null, { status: 200, message: "Data updated successfully" });
            });
        });
    },

    delete: (id, keyAccess, callback) => {
        db.query("SELECT key_access FROM akrab WHERE id = ?", [id], (err, results) => {
            if (err) return callback(err, null);
            if (!results || results.length === 0) {
                return callback(null, { status: 404, message: "Data not found" });
            }
            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }

            db.query("DELETE FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess], (deleteErr, result) => {
                if (deleteErr) return callback(deleteErr, null);

                redisClient.del(`akrab:${id}:${keyAccess}`);
                redisClient.del(`akrab_all:${keyAccess}`);

                return callback(null, { status: 200, message: "Data deleted successfully" });
            });
        });
    }
};

module.exports = AkrabModel;
