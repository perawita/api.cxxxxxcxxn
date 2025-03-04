require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    app: process.env.APP_NAME,
    backend: process.env.API_BACKEND,
    origin: process.env.API_ORIGIN,
    host: process.env.API_HOST,
    redis: process.env.REDIS_URL,
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_DATABASE
    },
    // secretKey: process.env.SECRET_KEY
};
