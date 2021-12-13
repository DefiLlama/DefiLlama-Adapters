const utils = require('../helper/utils');
const {toUSDTBalances} = require('../helper/balances');

const baseURL = 'https://api.latteswap.com/api'
async function fetch() {
  const totalTvl = await utils.fetchURL(`${baseURL}/v1/amm/defi-llama/tvl-exclude-latte`)
  return Number(totalTvl.data)
}

async function staking() {
  const latteTvl = await utils.fetchURL(`${baseURL}/v1/amm/defi-llama/tvl-latte-pool`)
  return toUSDTBalances(Number(latteTvl.data))
}

module.exports = {
  bsc:{
    fetch,
    staking
  },
  fetch
} 
