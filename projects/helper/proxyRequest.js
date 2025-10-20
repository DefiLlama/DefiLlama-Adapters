const axios = require('axios');
const https = require('https');
const { getEnv } = require('./env');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function fetchThroughProxy(rawUrl) {
    const url = new URL(rawUrl)
    const response = await axios({
        method: 'get',
        url: `https://pr.oxylabs.io:7777${url.pathname}${url.search}`,
        httpsAgent: agent,
        headers: {
            'Proxy-Authorization': 'Basic ' + Buffer.from(getEnv('PROXY_AUTH')).toString('base64'),
            Host: url.host
        }
    });
    return response.data
}

module.exports = {
  fetchThroughProxy
}
