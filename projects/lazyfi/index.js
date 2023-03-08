const { sumTokens } = require('../helper/chain/near')
async function tvl() {
  return sumTokens({ owners: ['app-rewards.lazyfi-wallet.near'], tokens: ['a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near']})
}

module.exports = {
  timetravel: false,
  near: { tvl }
}