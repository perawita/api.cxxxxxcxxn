const AkrabService = require('../services/AkrabService');

const PurchaseController = {
    akrabPurchase: async (req, res) => {
        try {
            // Ambil data dari headers dan body
            const keyAccess = req.headers['x-api-key'];
            const userId = req.headers['x-user-id'];
            const productId = req.body['product-id'];
            const customerNo = req.body['customer-no'];

            if (!keyAccess) {
                return res.status(400).json({ status: false, message: 'Missing required header: x-api-key' });
            }
            if (!userId) {
                return res.status(400).json({ status: false, message: 'Missing required header: x-user-id' });
            }
            if (!productId) {
                return res.status(400).json({ status: false, message: 'Missing required body parameter: product-id' });
            }
            if (!customerNo) {
                return res.status(400).json({ status: false, message: 'Missing required body parameter: customer-no' });
            }

            const result = await AkrabService.purchase(keyAccess, userId, productId, customerNo);

            return res.json(result);
        } catch (error) {
            console.error('Error in akrabPurchase:', error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error'
            });
        }
    }
};

module.exports = PurchaseController;
