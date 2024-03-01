const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(timestamp, _, _1, { api }) {
  api.sumTokens({ tokensAndOwners: [[ADDRESSES.blast.USDB, LENDING_POOL], [ADDRESSES.blast.WETH, COLLATERAL_VAULT]] })
}

module.exports = {
  misrepresentedTokens: false,
  blast: {
    tvl
  }
}