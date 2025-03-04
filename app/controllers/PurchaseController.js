const AkrabService = require('../services/AkrabService');
const AkrabModel = require('../models/AkrabModel');
const redisClient = require('../config/redis');


const PurchaseController = {
    akrabPurchase: async (req, res) => {
        try {
            // Ambil data dari headers dan body
            const keyAccess = req.headers['x-api-key'];
            const userId = req.headers['x-user-id'];
            const productId = req.body['product-id'];
            const customerNo = req.body['customer-no'];

            // Validasi input
            if (!keyAccess || !userId || !productId || !customerNo) {
                return res.status(400).json({
                    status: false,
                    message: 'Missing required headers or body parameters'
                });
            }

            // Ambil data dari AkrabModel
            AkrabModel.getById(productId, keyAccess, async (err, results) => {
                if (err) {
                    return res.status(500).json({ status: false, message: err.message });
                }
                
                if (!results.length || results[0].sisa_slot <= 0) {
                    return res.status(404).json({ status: false, message: 'Data not found' });
                }

                // Lanjutkan ke proses pembelian jika sisa_slot > 0
                try {
                    const result = await AkrabService.purchase(keyAccess, userId, results[0].id_produk, customerNo);
                    
                    if (result.status) {
                        // Hapus cache Redis setelah transaksi berhasil
                        await redisClient.del(`akrab:${productId}:${keyAccess}`);
                    }
                    
                    return res.json(result);
                } catch (error) {
                    console.error('Error in purchase process:', error);
                    return res.status(500).json({
                        status: false,
                        message: 'Internal Server Error'
                    });
                }
            });
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
