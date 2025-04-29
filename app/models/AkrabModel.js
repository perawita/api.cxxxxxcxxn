const db = require('../config/database');
const redisClient = require('../config/redis');

const AkrabModel = {
    getAll: async (keyAccess, callback) => {
        const cacheKey = `akrab_all:${keyAccess}`;
        console.log(`[getAll] Cache key: ${cacheKey}`);

        try {
            const cacheExists = await redisClient.exists(cacheKey);
            if (cacheExists) {
                const cachedData = await redisClient.get(cacheKey);
                console.log("[getAll] Cache hit");
                return callback(null, JSON.parse(cachedData));
            }
            console.log("[getAll] Cache miss");
        } catch (err) {
            console.error("[getAll] Redis error:", err);
        }

        db.query("SELECT * FROM akrab WHERE key_access = ?", [keyAccess], (err, results) => {
            if (err) {
                console.error("[getAll] DB Error:", err);
                return callback(err, null);
            }

            console.log("[getAll] DB Results:", results);
            redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            return callback(null, results);
        });
    },

    getById: async (id, keyAccess, columns = "*", callback) => {
        const cacheKey = `akrab:${id}:${keyAccess}:${Array.isArray(columns) ? columns.join(",") : columns}`;
        console.log(`[getById] Cache key: ${cacheKey}`);

        try {
            const cacheExists = await redisClient.exists(cacheKey);
            if (cacheExists) {
                const cachedData = await redisClient.get(cacheKey);
                console.log("[getById] Cache hit");
                return callback(null, JSON.parse(cachedData));
            }
            console.log("[getById] Cache miss");
        } catch (err) {
            console.error("[getById] Redis error:", err);
        }

        if (!Array.isArray(columns) && columns !== "*") {
            return callback(new Error("[getById] Kolom harus berupa array atau '*'"), null);
        }

        const selectColumns = Array.isArray(columns) && columns.length > 0 ? columns.join(", ") : "*";
        const query = `SELECT ${selectColumns} FROM akrab WHERE id = ? AND key_access = ?`;
        console.log(`[getById] SQL: ${query}, Values: [${id}, ${keyAccess}]`);

        db.query(query, [id, keyAccess], (err, results) => {
            if (err) {
                console.error("[getById] DB Error:", err);
                return callback(err, null);
            }

            console.log("[getById] DB Results:", results);
            if (results.length > 0) {
                redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            }

            return callback(null, results);
        });
    },

    create: (data, keyAccess, callback) => {
        console.log("[create] Received data:", data);

        if (!data.id_produk) {
            return callback(new Error("[create] 'id_produk' tidak boleh null"), null);
        }

        const query = `
            INSERT INTO akrab 
            (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access, quota_allocated, nama_member, nama_admin, deskripsi_produk) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            data.id_produk,
            data.nama_paket,
            data.harga,
            data.stok,
            data.Original_Price,
            data.sisa_slot,
            data.jumlah_slot,
            data.slot_terpakai,
            keyAccess,
            data.quota_allocated,
            data.nama_member || null,
            data.nama_admin || null,
            data.deskripsi_produk || null
        ];

        console.log("[create] SQL:", query);
        console.log("[create] Values:", values);

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("[create] DB Error:", err);
                return callback(err, null);
            }

            console.log("[create] Insert Result:", result);
            redisClient.del(`akrab_all:${keyAccess}`);
            return callback(null, result);
        });
    },

    update: (id, data, keyAccess, callback) => {
        const checkQuery = "SELECT key_access FROM akrab WHERE id = ?";
        console.log("[update] Checking key_access for id:", id);

        db.query(checkQuery, [id], (err, results) => {
            if (err) {
                console.error("[update] Check Error:", err);
                return callback(err, null);
            }
            if (results.length === 0) return callback(null, { status: 404, message: "Data not found" });

            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }

            const updateQuery = `
                UPDATE akrab 
                SET id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, sisa_slot=?, jumlah_slot=?, slot_terpakai=?, quota_allocated=?, nama_member=?, nama_admin=?, deskripsi_produk=? 
                WHERE id=? AND key_access=?`;

            const values = [
                data.id_produk,
                data.nama_paket,
                data.harga,
                data.stok,
                data.Original_Price,
                data.sisa_slot,
                data.jumlah_slot,
                data.slot_terpakai,
                data.quota_allocated,
                data.nama_member || null,
                data.nama_admin || null,
                data.deskripsi_produk || null,
                id,
                keyAccess
            ];

            console.log("[update] SQL:", updateQuery);
            console.log("[update] Values:", values);

            db.query(updateQuery, values, (updateErr, result) => {
                if (updateErr) {
                    console.error("[update] Update Error:", updateErr);
                    return callback(updateErr, null);
                }

                console.log("[update] Update Result:", result);
                redisClient.del(`akrab:${id}:${keyAccess}`);
                redisClient.del(`akrab_all:${keyAccess}`);

                return callback(null, { status: 200, message: "Data updated successfully" });
            });
        });
    },

    delete: (id, keyAccess, callback) => {
        const checkQuery = "SELECT key_access FROM akrab WHERE id = ?";
        console.log("[delete] Checking key_access for id:", id);

        db.query(checkQuery, [id], (err, results) => {
            if (err) {
                console.error("[delete] Check Error:", err);
                return callback(err, null);
            }
            if (results.length === 0) return callback(null, { status: 404, message: "Data not found" });

            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }

            db.query("DELETE FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess], (deleteErr, result) => {
                if (deleteErr) {
                    console.error("[delete] Delete Error:", deleteErr);
                    return callback(deleteErr, null);
                }

                console.log("[delete] Delete Result:", result);
                redisClient.del(`akrab:${id}:${keyAccess}`);
                redisClient.del(`akrab_all:${keyAccess}`);

                return callback(null, { status: 200, message: "Data deleted successfully" });
            });
        });
    }
};

module.exports = AkrabModel;
