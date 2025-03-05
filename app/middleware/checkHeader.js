const ApiKeyModel = require('../models/ApiKeyModel');

module.exports = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const userId = req.headers['x-user-id'];

        if (!apiKey || !userId) {
            return res.status(403).json({
                status: false,
                message: 'Forbidden: Missing API Key or User ID'
            });
        }

        const result = await ApiKeyModel.checkApiKey(apiKey);

        if (!result) {
            return res.status(403).json({
                status: false,
                message: 'Forbidden: Invalid API Key'
            });
        }

        // Pastikan API Key sesuai dengan User ID yang dikirim
        if (result.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({
                status: false,
                message: 'Forbidden: API Key does not match User ID'
            });
        }

        // Periksa apakah API Key sudah expired
        if (result.expires_at) {
            const now = new Date();
            const expiresAt = new Date(result.expires_at);

            // Format ke 'YYYY-MM-DD HH:MM:SS'
            const formatDate = (date) => {
                const pad = (num) => String(num).padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
                       `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            };

            if (formatDate(expiresAt) < formatDate(now)) {
                return res.status(403).json({
                    status: false,
                    message: 'Forbidden: API Key has expired'
                });
            }
        }

        // Simpan user_id di `req` untuk akses di middleware selanjutnya
        req.user_id = result.user_id;
        next();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Database error'
        });
    }
};
