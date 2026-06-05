const ADDRESSES = require('../helper/coreAssets.json')

const OPEN_ORACLE = '0xa731450131bE0120420e211a35704A19382489fb'

async function tvl(api) {
  return api.sumTokens({ owner: OPEN_ORACLE, tokens: [ADDRESSES.null, ADDRESSES.base.USDC] })
}

module.exports = {
  methodology: 'TVL is the native ETH and USDC held by the openOracle contract on Base.',
  base: { tvl },
}
