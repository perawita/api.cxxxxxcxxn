const config = require('../config/env');
const axios = require('axios');
const qs = require('qs'); 

const PropertiService = {
    akrabProperti: async (userId) =>{
        try {
            const url = `${config.backend}/akrab-add.php`;

            const response = await axios.post(url, qs.stringify({
                get_list_pengelola: '',
                user_id: userId,
            }).toString(), {
                headers: {
                    "accept": "application/json",
                    "content-type": "application/x-www-form-urlencoded",
                    "origin": `${config.origin}`,
                    "referer": `${url}`,
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
                }                  
            });

            return response.data;
        } catch (error) {
            return {
                status: false,
                message: error.response ? error.response.data : error.message
            };
        }
    }
};

module.exports = PropertiService;