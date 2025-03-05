const db = require('../config/database');
const redisClient = require('../config/redis');

const AkrabModel = {
    getAll: async (keyAccess, callback) => {
        const cacheKey = `akrab_all:${keyAccess}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return callback(null, JSON.parse(cachedData));
        }

        db.query("SELECT * FROM akrab WHERE key_access = ?", [keyAccess], (err, results) => {
            if (err) return callback(err, null);

            // Simpan hasil query ke Redis selama 10 menit
            redisClient.setEx(cacheKey, 600, JSON.stringify(results));

            return callback(null, results);
        });
    },

    getById: async (id, keyAccess, columns = "*", callback) => {
        const cacheKey = `akrab:${id}:${keyAccess}:${columns}`;
        const cachedData = await redisClient.get(cacheKey);
    
        if (cachedData) {
            return callback(null, JSON.parse(cachedData));
        }
    
        if (!Array.isArray(columns)) {
            return callback(new Error("columns cannot be nulls add array or string '*'."));
        }
        const selectColumns = columns.length > 0 ? columns.join(", ") : "*";
    
        db.query(`SELECT ${selectColumns} FROM akrab WHERE id = ? AND key_access = ?`, [id, keyAccess], (err, results) => {
            if (err) return callback(err, null);
    
            if (results.length > 0) {
                // Simpan hasil query ke Redis selama 10 menit
                redisClient.setEx(cacheKey, 600, JSON.stringify(results));
            }
    
            return callback(null, results);
        });
    },
       

    create: (data, keyAccess, callback) => {
        const query = "INSERT INTO akrab (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access, quota_allocated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, keyAccess, data.quota_allocated];

        db.query(query, values, (err, result) => {
            if (err) return callback(err, null);

            // Hapus cache agar data baru bisa muncul
            redisClient.del(`akrab_all:${keyAccess}`);

            return callback(null, result);
        });
    },

    update: (id, data, keyAccess, callback) => {
        const checkQuery = "SELECT key_access FROM akrab WHERE id = ?";

        db.query(checkQuery, [id], (err, results) => {
            if (err) return callback(err, null);

            if (results.length === 0) {
                return callback(null, { status: 404, message: "Data not found" });
            }

            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }

            const updateQuery = `UPDATE akrab SET id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, sisa_slot=?, jumlah_slot=?, slot_terpakai=?, quota_allocated=? WHERE id=? AND key_access=?`;
            const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, data.quota_allocated, id, keyAccess];

            db.query(updateQuery, values, (updateErr, result) => {
                if (updateErr) return callback(updateErr, null);

                // Hapus cache agar data yang baru diperbarui bisa diambil ulang
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

            if (results.length === 0) {
                return callback(null, { status: 404, message: "Data not found" });
            }

            if (results[0].key_access !== keyAccess) {
                return callback(null, { status: 403, message: "Forbidden: Invalid key_access" });
            }

            db.query("DELETE FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess], (deleteErr, result) => {
                if (deleteErr) return callback(deleteErr, null);

                // Hapus cache setelah menghapus data
                redisClient.del(`akrab:${id}:${keyAccess}`);
                redisClient.del(`akrab_all:${keyAccess}`);

                return callback(null, { status: 200, message: "Data deleted successfully" });
            });
        });
    }
};

module.exports = AkrabModel;
