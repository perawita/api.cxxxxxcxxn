const config = require('../config/env');
const axios = require('axios');
const qs = require('qs'); 

const AkrabService = {
    purchase: async (keyAccess, userId, product_id, customer_no, customer_name, admin_name) => {
        
        try {
            const url = `${config.backend}/akrab-otomatis.php`;

            const response = await axios.post(url, qs.stringify({
                buy_kuota: '',
                user_id: userId,
                customer_no: customer_no,
                product_id: product_id,
                key_access: keyAccess,
                customer_name : customer_name,
                admin_name: admin_name
            }), {
                headers: {
                    "cache-control": "no-store, no-cache, must-revalidate",
                    "content-encoding": "zstd", // hati-hati, ini bisa bermasalah!
                    "content-security-policy": "upgrade-insecure-requests",
                    "content-type": "application/x-www-form-urlencoded",
                    "Connection": "keep-alive",
                    "pragma": "no-cache",
                    "vary": "Accept-Encoding"
                },
                timeout: 10000 // <--- Tambahkan ini
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
