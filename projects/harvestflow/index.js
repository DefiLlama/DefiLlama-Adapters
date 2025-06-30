const { get } = require('../helper/http')
const BigNumber = require('bignumber.js')
const ADDRESSES = require("../helper/coreAssets.json");

const topUSD = value => BigNumber(value).times(1e6).toFixed(0)
const topUSDBalances = value => ({
    [ADDRESSES.plume_mainnet.pUSD]:topUSD(value)
})

async function withdraw() {
  const url = 'https://harvestflow-api-production.up.railway.app/token-events/total';
  const data = await get(url);
  return topUSDBalances(data.totalAmount)
}

async function tvl(_, _1, _2, { api }) {
  return await withdraw()
}

const CONFIG = {
  misrepresentedTokens: true,
  plume_mainnet: { 
    tvl
  },
};

module.exports={
  ...CONFIG,
} 