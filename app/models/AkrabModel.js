const db = require('../config/database');
const redisClient = require('../config/redis');

const AkrabModel = {
    getAll: async (keyAccess, callback) => {
        const cacheKey = `akrab_all:${keyAccess}`;
        
        try {
            const cacheExists = await redisClient.exists(cacheKey);
            if (cacheExists) {
                const cachedData = await redisClient.get(cacheKey);
                return callback(null, JSON.parse(cachedData));
            }
        } catch (err) {
            console.error("Redis error:", err);
        }

        db.query("SELECT * FROM akrab WHERE key_access = ?", [keyAccess], (err, results) => {
            if (err) return callback(err, null);

            redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            return callback(null, results);
        });
    },

    getById: async (id, keyAccess, columns = "*", callback) => {
        const cacheKey = `akrab:${id}:${keyAccess}:${Array.isArray(columns) ? columns.join(",") : columns}`;
        
        try {
            const cacheExists = await redisClient.exists(cacheKey);
            if (cacheExists) {
                const cachedData = await redisClient.get(cacheKey);
                return callback(null, JSON.parse(cachedData));
            }
        } catch (err) {
            console.error("Redis error:", err);
        }

        if (!Array.isArray(columns) && columns !== "*") {
            return callback(new Error("Kolom harus berupa array atau string '*'."), null);
        }

        const selectColumns = Array.isArray(columns) && columns.length > 0 ? columns.join(", ") : "*";

        db.query(`SELECT ${selectColumns} FROM akrab WHERE id = ? AND key_access = ?`, [id, keyAccess], (err, results) => {
            if (err) return callback(err, null);

            if (results.length > 0) {
                redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            }

            return callback(null, results);
        });
    },

    create: (data, keyAccess, callback) => {
        const query = "INSERT INTO akrab (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access, quota_allocated, nama_member, nama_admin, deskripsi_produk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
    
        db.query(query, values, (err, result) => {
            if (err) return callback(err, null);
    
            redisClient.del(`akrab_all:${keyAccess}`);
            return callback(null, result);
        });
    },
    
    update: (id, data, keyAccess, callback) => {
        const checkQuery = "SELECT key_access FROM akrab WHERE id = ?";
    
        db.query(checkQuery, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, { status: 404, message: "Data not found" });
    
            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }
    
            const updateQuery = `UPDATE akrab SET id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, sisa_slot=?, jumlah_slot=?, slot_terpakai=?, quota_allocated=?, nama_member=?, nama_admin=?, deskripsi_produk=? WHERE id=? AND key_access=?`;
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
    
            db.query(updateQuery, values, (updateErr, result) => {
                if (updateErr) return callback(updateErr, null);
    
                // Hapus cache jika data berubah
                redisClient.del(`akrab:${id}:${keyAccess}`);
                redisClient.del(`akrab_all:${keyAccess}`);
    
                return callback(null, { status: 200, message: "Data updated successfully" });
            });
        });
    },    

    delete: (id, keyAccess, callback) => {
        const checkQuery = "SELECT key_access FROM akrab WHERE id = ?";

        db.query(checkQuery, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, { status: 404, message: "Data not found" });

            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }

            db.query("DELETE FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess], (deleteErr, result) => {
                if (deleteErr) return callback(deleteErr, null);

                // Hapus cache setelah data dihapus
                redisClient.del(`akrab:${id}:${keyAccess}`);
                redisClient.del(`akrab_all:${keyAccess}`);

                return callback(null, { status: 200, message: "Data deleted successfully" });
            });
        });
    }
};

module.exports = AkrabModel;
