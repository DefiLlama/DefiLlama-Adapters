const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Gloam's shielded pool (ShieldPoolPayments), the same address on both chains.
const POOL = '0x39e28cde55cab798874746ac52cb4b5cc99a0194'
const GLOAM = '0xDcD885F5c60b3aD49F6D58718696417314e8724d'
const OUSD = '0x20c0000000000000000000006a37da5c996874be'

module.exports = {
  methodology: 'TVL is the stablecoins held by the Gloam shielded pool on Robinhood Chain and Tempo: money people have added to their private balances and not yet cashed out. $GLOAM held in the pool is the protocol\'s own token and is counted separately under ownTokens.',
  start: '2026-10-21',
  robinhood: {
    tvl: sumTokensExport({ owner: POOL, tokens: [ADDRESSES.robinhood.USDG] }),
    ownTokens: async (api) => {
      // $GLOAM is priced through its CoinGecko id; the token address is not priced on Robinhood Chain yet.
      const balance = await api.call({ abi: 'erc20:balanceOf', target: GLOAM, params: [POOL] })
      api.addCGToken('gloam', balance / 1e18)
    },
  },
  tempo: {
    tvl: sumTokensExport({ owner: POOL, tokens: [ADDRESSES.tempo.pathUSD, ADDRESSES.tempo.USDC_E, ADDRESSES.tempo.USDT0, OUSD] }),
  },
}
