const config = require('../config/env');
const axios = require('axios');
const qs = require('qs'); 

const AkrabService = {
    purchase: async (userId, product_id, customer_no) => {
        try {
            const url = `${config.backend}/akrab-otomatis.php`;

            const response = await axios.post(url, qs.stringify({
                buy_kuota: '',
                user_id: userId,
                customer_no: customer_no,
                product_id: product_id,
            }), {
                headers: {
                    "alt-svc": "h3=\":443\"; ma=86400",
                    "cache-control": "no-store, no-cache, must-revalidate",
                    "cf-cache-status": "DYNAMIC",
                    "cf-ray": "91797af82ac79cbd-SIN",
                    "content-encoding": "zstd",
                    "content-security-policy": "upgrade-insecure-requests",
                    "content-type": "text/html; charset=UTF-8",
                    "date": "Tue, 25 Feb 2025 17:40:25 GMT",
                    "expires": "Thu, 19 Nov 1981 08:52:00 GMT",
                    "nel": {
                      "success_fraction": 0,
                      "report_to": "cf-nel",
                      "max_age": 604800
                    },
                    "panel": "hpanel",
                    "platform": "hostinger",
                    "pragma": "no-cache",
                    "priority": "u=0,i",
                    "report-to": {
                      "endpoints": [
                        {
                          "url": "https://a.nel.cloudflare.com/report/v4?s=LxHs2ntA3MdpAHmbkTL1rEOlKzNXGSkI7ijyYijrm0p26Ogx%2Fzo9Puk9ycKUYgBVvGOtRL%2BKFPTIGutz1dkIlnCJEqlN7ZU8ixMSeEGK8qC1pCPvIYtepGa2KTV7lLcLtw%3D%3D"
                        }
                      ],
                      "group": "cf-nel",
                      "max_age": 604800
                    },
                    "server": "cloudflare",
                    "server-timing": [
                      "cfL4;desc=\"?proto=QUIC&rtt=44842&min_rtt=44387&rtt_var=9811&sent=12&recv=9&lost=0&retrans=0&sent_bytes=4243&recv_bytes=4687&delivery_rate=13111&cwnd=12000&unsent_bytes=0&cid=cbe4f87f90810b9b&ts=96&x=1\"",
                      "cfExtPri",
                      "cfHdrFlush;dur=0"
                    ],
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
