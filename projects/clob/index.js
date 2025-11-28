const axios = require("axios");
const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js");

async function arbitrumTvl(api) {
  const url = `https://api.orderly.org/v1/public/balance/stats?broker_id=desk`
  const response = await axios.get(url)
  const tvl = new BigNumber(response.data.data.total_holding).times(1e6).toFixed(0)

  api.add(ADDRESSES.arbitrum.USDC_CIRCLE, tvl)
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl: arbitrumTvl },
};