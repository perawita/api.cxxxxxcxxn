const config = require('./env');
const redis = require('redis');

const client = redis.createClient({
    url: config.redis
});

client.on('error', (err) => {
    console.error('Redis Error:', err);
});

client.connect()
    .then(() => console.log('Connected to Redis'))
    .catch(err => console.error('Redis Connection Error:', err));

module.exports = client;
