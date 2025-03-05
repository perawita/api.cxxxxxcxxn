const AkrabModel = require('../models/AkrabModel');

const AkrabController = {
    getAll: async (req, res) => {
        try {
            const keyAccess = req.headers['x-api-key'];
            const results = await AkrabModel.getAll(keyAccess);
            res.json({ status: true, data: results });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const keyAccess = req.headers['x-api-key'];
            const result = await AkrabModel.getById(id, keyAccess);

            if (!result) {
                return res.status(404).json({ status: false, message: 'Data not found' });
            }

            res.json({ status: true, data: result });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const keyAccess = req.headers['x-api-key'];
            const data = req.body;
            const result = await AkrabModel.create(data, keyAccess);

            res.status(201).json({ 
                status: true, 
                message: 'Data added successfully', 
                id: result.id 
            });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const keyAccess = req.headers['x-api-key'];

            const result = await AkrabModel.update(id, data, keyAccess);

            if (result.status === 404) {
                return res.status(404).json({ status: false, message: "Data not found" });
            }

            if (result.status === 403) {
                return res.status(403).json({ status: false, message: "Forbidden: Invalid key_access" });
            }

            res.json({ status: true, message: "Data updated successfully" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const keyAccess = req.headers['x-api-key'];

            const result = await AkrabModel.delete(id, keyAccess);

            if (result.status === 404) {
                return res.status(404).json({ status: false, message: "Data not found" });
            }

            if (result.status === 403) {
                return res.status(403).json({ status: false, message: "Forbidden: Invalid key_access" });
            }

            res.json({ status: true, message: "Data deleted successfully" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
};

module.exports = AkrabController;
