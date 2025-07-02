const { get } = require('../helper/http')
const BigNumber = require('bignumber.js')
const ADDRESSES = require("../helper/coreAssets.json");

const topUSD = value => BigNumber(value).times(1e6).toFixed(0)
const topUSDBalances = value => ({
    [ADDRESSES.plume_mainnet.pUSD]:topUSD(value)
})

async function withdraw(network) {
  const url = `https://harvestflow-api-production.up.railway.app/token-events/total/${network}`;
  const data = await get(url);
  return topUSDBalances(data.totalAmount)
}

async function plumeTvl() {
  return await withdraw('plume');
}

async function polygonTvl() {
  return await withdraw('polygon');
}

const CONFIG = {
  misrepresentedTokens: true,
  plume_mainnet: { 
    tvl: plumeTvl
  },
  polygon: {
    tvl: polygonTvl
  }
};

module.exports={
  ...CONFIG,
} 