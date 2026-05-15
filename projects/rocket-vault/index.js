const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Rocket Liquidity Provider main vault on Arbitrum.
// On-chain replacement for the previous fetch from `beta.rocket-cluster-1.com`,
// which is unreachable.
const VAULT = '0x6BC2179a284CB2A2857C379391E0158524de7cA0'

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: true,
  methodology: 'TVL is the on-chain stablecoin balance held at the Rocket Liquidity Provider vault on Arbitrum.',
  arbitrum: {
    tvl: sumTokensExport({
      owners: [VAULT],
      tokens: [
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.DAI,
      ],
    }),
  },
}
