require('dotenv').config();
const axios = require('axios');
const https = require('https');

const proxyHost = process.env.PROXY_HOST;
const proxyPort = process.env.PROXY_PORT;
const username = process.env.PROXY_USERNAME;
const password = process.env.PROXY_PASSWORD;

function getProxyOptions() {
  return {
    host: proxyHost,
    port: proxyPort,
    auth: {
      username,
      password
    }
  };
}

async function fetchThroughOxylabsProxy(url) {
  const proxyOptions = getProxyOptions();
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  const response = await axios({
    method: 'get',
    url: url,
    httpsAgent: agent,
    proxy: {
      host: proxyOptions.host,
      port: proxyOptions.port,
      auth: {
        username: proxyOptions.auth.username,
        password: proxyOptions.auth.password
      }
    },
    headers: {
      'Proxy-Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
    }
  });

  return response.data;
}

fetchThroughOxylabsProxy('https://jsonplaceholder.typicode.com/posts/1')
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error.message));

// const ipUrl = 'https://api64.ipify.org?format=json';
// const mockUrl = 'https://jsonplaceholder.typicode.com/posts/1';
// const realApi = 'https://api.beefy.finance/tvl';
// const realApi = 'https://public1.nuls.io/nuls/tvl';


