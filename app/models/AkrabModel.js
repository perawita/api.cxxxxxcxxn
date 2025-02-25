const db = require('../config/database');

const AkrabModel = {
    getAll: (keyAccess, callback) => {
        db.query("SELECT * FROM akrab WHERE key_access = ?", [keyAccess], callback);
    },

    getById: (id, keyAccess, callback) => {
        db.query("SELECT * FROM akrab WHERE id = ? AND key_access = ?", [id, keyAccess], callback);
    },

    create: (data, keyAccess, callback) => {
        const query = "INSERT INTO akrab (id_produk, nama_paket, harga, stok, Original_Price, sisa_slot, jumlah_slot, slot_terpakai, key_access) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, keyAccess];
        db.query(query, values, callback);
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
    
            const updateQuery = `UPDATE akrab SET id_produk=?, nama_paket=?, harga=?, stok=?, Original_Price=?, sisa_slot=?, jumlah_slot=?, slot_terpakai=? WHERE id=? AND key_access=?`;
            const values = [data.id_produk, data.nama_paket, data.harga, data.stok, data.Original_Price, data.sisa_slot, data.jumlah_slot, data.slot_terpakai, id, keyAccess];
    
            db.query(updateQuery, values, (updateErr, result) => {
                if (updateErr) return callback(updateErr, null);
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
                return callback(null, { status: 200, message: "Data deleted successfully" });
            });
        });
    }
    
};

module.exports = AkrabModel;