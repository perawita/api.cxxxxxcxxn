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
                    "alt-svc": "h3=\":443\"; ma=86400",
                    "cache-control": "no-store, no-cache, must-revalidate",
                    "cf-cache-status": "DYNAMIC",
                    "content-encoding": "zstd",
                    "content-security-policy": "upgrade-insecure-requests",
                    "content-type": "application/x-www-form-urlencoded",
                    "Connection": "keep-alive",
                    "panel": "hpanel",
                    "platform": "hostinger",
                    "pragma": "no-cache",
                    "priority": "u=0,i",
                    "vary": "Accept-Encoding",
                    "x-powered-by": "PHP/8.2.27",
                    "x-turbo-charged-by": "LiteSpeed"
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
