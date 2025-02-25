const ApiKeyModel = require('../models/ApiKeyModel');

module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const userId = req.headers['x-user-id'];

    if (!apiKey || !userId) {
        return res.status(403).json({
            status: false,
            message: 'Forbidden: Missing API Key or User ID'
        });
    }

    ApiKeyModel.checkApiKey(apiKey, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Database error'
            });
        }

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

        req.user_id = result.user_id;
        next();
    });
};
