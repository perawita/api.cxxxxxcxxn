const PropertiService = require('../services/PropertiService');

const PropertiController = {
    getListAkrab: async (req, res) =>{
        try {
            // Ambil data dari headers
            const userId = req.headers['x-user-id'];
            
            if (!userId) {
                return res.status(400).json({ status: false, message: 'Missing required header: x-user-id' });
            }

            const result = await PropertiService.akrabProperti(userId);

            return res.json(result);
        } catch (error) {
            console.error('Error in akrabProperti:', error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error'
            });
        }
    }
};

module.exports = PropertiController;