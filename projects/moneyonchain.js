// Money on Chain exists on the RSK chain
// Based on four tokens:
// The DoC, a USD price pegged Stablecoin token.
// The BPro (Bitpro) a token designed for BTC hodlers, to earn a rent on Bitcoin and gain free leverage.
// The BTCx, a token that represents a leveraged long bitcoin holding position.
// The MoC token, designed to govern a decentralized autonomous organization (DAO) that will govern the Smart Contracts.


// Various API endpoints: https://api.moneyonchain.com/api/report/

// stats from https://moneyonchain.com/stats/
const ADDRESSES = require('./helper/coreAssets.json')

async function tvl(api) {
  const docCollateral = '0xf773b590af754d597770937fa8ea7abdf2668370'
  return api.sumTokens({ owner: docCollateral, tokens: [ADDRESSES.null]})
}

module.exports = {
  methodology: `TVL accounts for Total rBTC in the system`,
  rsk: {
    tvl,
  }
}