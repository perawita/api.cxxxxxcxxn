const config = require('../config/env');
const axios = require('axios');
const qs = require('qs'); 

const AkrabService = {
    purchase: async (keyAccess, userId, product_id, customer_no) => {
        try {
            const url = `${config.backend}/akrab-otomatis.php`;

            const response = await axios.post(url, qs.stringify({
                buy_kuota: '',
                user_id: userId,
                customer_no: customer_no,
                product_id: product_id,
                key_access: keyAccess
            }), {
                headers: {
                  "cache-control": "no-store, no-cache, must-revalidate",
                  "content-encoding": "zstd",
                  "content-security-policy": "upgrade-insecure-requests",
                  "content-type": "application/x-www-form-urlencoded",
                  "Connection": "keep-alive",
                  "pragma": "no-cache",
                  "vary": "Accept-Encoding"
                }
            });

            return response.data;
        } catch (error) {
            return {
                status: false,
                message: error.response ? error.response.data : error.message
            };
        }
    },
    
};

module.exports = AkrabService;
