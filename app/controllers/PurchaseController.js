const AkrabService = require('../services/AkrabService');
const AkrabModel = require('../models/AkrabModel');
const redisClient = require('../config/redis');

const PurchaseController = {
    akrabPurchase: async (req, res) => {
        try {
            // Ambil data dari headers dan body
            const { 'x-api-key': keyAccess, 'x-user-id': userId } = req.headers;
            const { 'product-id': productId, 'customer-no': customerNo } = req.body;

            // Validasi input
            if (![keyAccess, userId, productId, customerNo].every(Boolean)) {
                return res.status(400).json({
                    status: false,
                    message: 'Missing required headers or body parameters'
                });
            }

            const cacheKey = `akrab:${productId}:${keyAccess}`;
            let productData = await new Promise((resolve, reject) => {
                AkrabModel.getById(productId, keyAccess, (err, results) => {
                    if (err) return reject(err);
                    resolve(results.length ? results[0] : null);
                });
            });


            if (!productData || productData.sisa_slot <= 0) {
                return res.status(404).json({ status: false, message: 'Slot is not ready' });
            }

            // Proses pembelian
            const result = await AkrabService.purchase(keyAccess, userId, productData.id_produk, customerNo);

            if (result.status) {
                await redisClient.del(cacheKey); // Hapus cache setelah transaksi berhasil
            }

            return res.json(result);
        } catch (error) {
            console.error('Error in akrabPurchase:', error);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = PurchaseController;
