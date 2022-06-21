const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetchPolygon() {
  let response = await retry(async bail => await axios.get('https://izumi.finance/api/v1/farm/stat/chaintvl/?chainId=137'))
  let tvl = new BigNumber(response.data.data.tvl).toFixed(2);
  return tvl;
}

async function fetchArbitrum() {
  let response = await retry(async bail => await axios.get('https://izumi.finance/api/v1/farm/stat/chaintvl/?chainId=42161'))
  let tvl = new BigNumber(response.data.data.tvl).toFixed(2);
  return tvl;
}

async function fetchEthereum() {
  let response = await retry(async bail => await axios.get('https://izumi.finance/api/v1/farm/stat/chaintvl/?chainId=1'))
  let tvl = new BigNumber(response.data.data.tvl).toFixed(2);
  return tvl;
}

async function fetch() {
  let response = await retry(async bail => await axios.get('https://izumi.finance/api/v1/farm/stat/tvl'))
  let tvl = new BigNumber(response.data.data.tvl).toFixed(2);
  return tvl;
}

async function pool2() {
  let response = await retry(async bail => await axios.get('https://izumi.finance/api/v1/farm/stat/pool2tvl'))
  let tvl = new BigNumber(response.data.data.tvl).toFixed(2);
  return tvl;
}

module.exports = {
    ethereum: {
        fetch: fetchEthereum,
    },
    polygon: {
        fetch: fetchPolygon,
    },
    arbitrum: {
        fetch: fetchArbitrum,
    },
    pool2: {
        fetch: pool2
    },
    fetch,
}
