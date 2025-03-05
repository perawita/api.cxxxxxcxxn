const config = require('../config/env');
const axios = require('axios');
const qs = require('qs');

const AkrabService = {
    purchase: async (keyAccess, userId, product_id, customer_no) => {
        try {
            const url = `${config.backend}/akrab-otomatis.php`;

            const payload = qs.stringify({
                buy_kuota: '',
                user_id: userId,
                customer_no,
                product_id,
                key_access: keyAccess
            });

            const headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache"
            };

            const response = await axios.post(url, payload, { headers });

            return response.data;
        } catch (error) {
            console.error('Error in purchase:', error.message);
            return {
                status: false,
                message: error.response?.data || 'Failed to process request'
            };
        }
    }
};

module.exports = AkrabService;
