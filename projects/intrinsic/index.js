// Intrinsic — Uniswap v3 concentrated-liquidity DEX on Rootstock (rsk).
// TVL = tokens locked across all Intrinsic v3 pools, enumerated from the
// factory's PoolCreated events via the standard uniV3Export helper.
//
// BPD (Money Protocol's RBTC-backed stablecoin) has no external price feed, so
// it is valued 1:1 as USD₮0 — the rate it trades at in the BPD/USD₮0 pool — so
// both sides of the pool are counted.
const { uniV3Export } = require('../helper/uniswapV3')

const FACTORY = '0x82dF0a279767021734EcE752979B34b3959C25D8'
const FROM_BLOCK = 8275250
const BPD = '0x1fe2F558E2120C4BdF4217248d2940043a8E1208'   // 18 decimals, unpriced
const USDT0 = '0x779Ded0c9e1022225f8E0630b35a9b54bE713736' // 6 decimals, priced (~$1)

const base = uniV3Export({ rsk: { factory: FACTORY, fromBlock: FROM_BLOCK } })

module.exports = {
  methodology:
    'Counts tokens locked in all Intrinsic v3 pools (enumerated from the factory PoolCreated events). BPD has no external price feed, so it is valued 1:1 as USD₮0 — the rate it trades at in the pool.',
  start: 1764806400, // factory deploy ~2025-12-04
  rsk: {
    tvl: async (api) => {
      await base.rsk.tvl(api)
      const balances = api.getBalances()
      const bpdKey = 'rsk:' + BPD.toLowerCase()
      const bpd = balances[bpdKey]
      if (bpd && bpd !== '0') {
        delete balances[bpdKey]                               // drop unpriced BPD
        api.add(USDT0, (BigInt(bpd) / 10n ** 12n).toString()) // count it 1:1 as USD₮0 (18->6 dp)
      }
      return api.getBalances()
    },
  },
}
