const sdk = require("@defillama/sdk");
const axios = require("axios");
const retry = require('async-retry')
const BigNumber = require("bignumber.js");

// const chef = "0x2639779d6ca9091483a2a7b9a1fe77ab83b90281";
const client = axios.create({
  baseURL: 'https://api.starfish.finance/v1'
})

async function fetchEthTvl() {
  const { data } = await retry(await client.get('/starfish/ethereum/tvl'))
  return new BigNumber(data).toFixed(2)
}

async function fetchAstarTvl() {
  const { data } = await retry(await client.get('/starfish/astar/tvl'))
  return new BigNumber(data).toFixed(2)
}

module.exports = {
  ethereum: {
    fetch: fetchEthTvl,
  },
  astar: {
    fetch: fetchAstarTvl,
  }
};
