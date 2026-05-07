const ADDRESSES = require('../helper/coreAssets.json')
const COLLATERAL_VAULT = "0xaD7094D06818d9C0cce6D3f97E709D84f964F144"
const USDT = ADDRESSES.corn.USDT0

async function tvl(api) {
  return api.sumTokens({ tokens: [USDT], owner: COLLATERAL_VAULT })
}

module.exports = {
  methodology: 'Sum of all USDT deposits in Collateral Vault',
  start: 6195000,
  hyperliquid: {
    tvl,
  }
};
