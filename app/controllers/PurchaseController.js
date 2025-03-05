const AkrabService = require('../services/AkrabService');
const AkrabModel = require('../models/AkrabModel');
const redisClient = require('../config/redis');

const PurchaseController = {
    akrabPurchase: async (req, res) => {
        try {
            // Ambil data dari headers dan body
            const keyAccess = req.headers['x-api-key'];
            const userId = req.headers['x-user-id'];
            const { productId, customerNo } = req.body; // Gunakan camelCase untuk lebih sesuai dengan JavaScript

            // Validasi input
            if (!keyAccess || !userId || !productId || !customerNo) {
                return res.status(400).json({
                    status: false,
                    message: 'Missing required headers or body parameters'
                });
            }

            const cacheKey = `akrab:${productId}:${keyAccess}`;

            // Cek cache di Redis sebelum query ke database
            let productData = await redisClient.get(cacheKey);
            if (productData) {
                productData = JSON.parse(productData);
            } else {
                // Ambil data produk dari database
                productData = await AkrabModel.getById(productId, keyAccess);
                if (productData) {
                    await redisClient.set(cacheKey, JSON.stringify(productData), 'EX', 300); // Cache 5 menit
                }
            }

            if (!productData || productData.sisa_slot <= 0) {
                return res.status(404).json({ status: false, message: 'Slot is not ready' });
            }

            // Proses pembelian melalui service
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
