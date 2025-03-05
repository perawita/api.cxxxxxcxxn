const AkrabModel = require('../models/AkrabModel');

const AkrabController = {
    getAll: (req, res) => {
        const keyAccess = req.headers['x-api-key'];
        AkrabModel.getAll(keyAccess, (err, results) => {
            if (err) return res.status(500).json({ status: false, message: err.message });
            res.json({ status: true, data: results });
        });
    },

    getById: (req, res) => {
        const { id } = req.params;
        const keyAccess = req.headers['x-api-key'];
        AkrabModel.getById(id, keyAccess, (err, results) => {
            if (err) return res.status(500).json({ status: false, message: err.message });
            if (!results.length) return res.status(404).json({ status: false, message: 'Data not found' });
            res.json({ status: true, data: results[0] });
        });
    },

    create: (req, res) => {
        const keyAccess = req.headers['x-api-key'];
        const data = req.body;
        AkrabModel.create(data, keyAccess, (err, result) => {
            if (err) return res.status(500).json({ status: false, message: err.message });
            res.status(201).json({ status: true, message: 'Data added successfully', id: result.insertId });
        });
    },
    
    update: (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const keyAccess = req.headers['x-api-key'];
    
        AkrabModel.update(id, data, keyAccess, (err, result) => {
            if (err) return res.status(500).json({ status: false, message: err.message });
    
            if (result.status === 404) {
                return res.status(404).json({ status: false, message: "Data not found" });
            }
    
            if (result.status === 403) {
                return res.status(403).json({ status: false, message: "Forbidden: Invalid key_access" });
            }
    
            res.json({ status: true, message: "Data updated successfully" });
        });
    },
    
    delete: (req, res) => {
        const { id } = req.params;
        const keyAccess = req.headers['x-api-key'];
    
        AkrabModel.delete(id, keyAccess, (err, result) => {
            if (err) return res.status(500).json({ status: false, message: err.message });
    
            if (result.status === 404) {
                return res.status(404).json({ status: false, message: "Data not found" });
            }
    
            if (result.status === 403) {
                return res.status(403).json({ status: false, message: "Forbidden: Invalid key_access" });
            }
    
            res.json({ status: true, message: "Data deleted successfully" });
        });
    }    
};

module.exports = AkrabController;