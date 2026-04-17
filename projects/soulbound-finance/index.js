const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const DEPOSIT_POOL = '0xe8D294F3fff2A5CB34D15eCdEF34A53b01f5A462'
const CLAIM_POOL = '0x5F5a08fFFE8071410f3ECe2FCC40D81B457b28ce'

const tokens = [
  nullAddress,                        // ETH
  ADDRESSES.arbitrum.USDC_CIRCLE,     // USDC (native Circle)
  ADDRESSES.arbitrum.DAI,             // DAI
  ADDRESSES.arbitrum.WBTC,            // WBTC
]

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [DEPOSIT_POOL, CLAIM_POOL],
    tokens,
  })
}

module.exports = {
  methodology: 'TVL is the sum of all assets held in the DepositPool (user deposits awaiting transfer generation) and ClaimPool (funds backing outstanding transfers and the network fee pool) across ETH, USDC, DAI, and WBTC on Arbitrum One.',
  arbitrum: {
    tvl,
  },
}
