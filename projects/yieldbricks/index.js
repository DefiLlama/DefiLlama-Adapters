const { sumTokensExport } = require('../helper/unwrapLPs')

const TOKENS_YBR_ARBITRUM = [
    "0x11920f139a3121c2836e01551d43f95b3c31159c"
]

const STAKING_POOLS = [
    "0x7436750e80bB956C6488A879D573cA417D6712A2",
    "0x80EF7E080EfC299cd6a7Ed8341273d935252c896",
]

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: `
  TVL counts YBR tokens staked by users in the YieldBricks staking pools on Arbitrum.
  The staking section shows the same value but categorized separately.
  USD value is derived from YBR market prices.`,

    arbitrum: {
        staking: sumTokensExport({
            owners: STAKING_POOLS,
            tokens: TOKENS_YBR_ARBITRUM,
            chain: 'arbitrum'
        }),
        tvl: () => ({}),
    },
}
