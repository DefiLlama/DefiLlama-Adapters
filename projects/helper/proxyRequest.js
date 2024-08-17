const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function fetchThroughProxy(rawUrl) {
    const url = new URL(rawUrl)
    const response = await axios({
        method: 'get',
        url: `https://pr.oxylabs.io:7777${url.pathname}`,
        httpsAgent: agent,
        headers: {
            'Proxy-Authorization': 'Basic ' + Buffer.from(`${process.env.PROXY_AUTH}`).toString('base64'),
            Host: url.host
        }
    });
    return response.data
}

module.exports = {
  fetchThroughProxy
}
