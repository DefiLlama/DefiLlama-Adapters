const ADDRESSES = require('../helper/coreAssets.json')

// Ilyris — pull-based discrete-bin AMM on Robinhood Chain (4663).
// Factory enumerates every pool; TVL is ERC-20 balances held by those pools.
// No router: LPs deposit straight into each BinPool.
// FeeStaking holds user-staked YRIS (+ reward inventory when funded).

const FACTORY = '0x3Bf76F2E41Ac7996c822455f4c78fa2026465C4D'
const FEE_STAKING = '0x868ae20E6c1EA3b6Fdab5042Ea721eB51b237183'
const YRIS = '0xD6af4536baB5EA74bCF872CA181619Cc3157683E'

// Known quote / base assets on Hood. Unknown tokens (e.g. YRIS before a
// DefiLlama price exists) are still summed; Llama prices what it can.
const KNOWN = [
  ADDRESSES.robinhood.WETH,
  ADDRESSES.robinhood.USDG,
  YRIS,
]

async function tvl(api) {
  const n = await api.call({ target: FACTORY, abi: 'uint256:allPoolsLength' })
  const indices = Array.from({ length: Number(n) }, (_, i) => i)
  const pools = await api.multiCall({
    target: FACTORY,
    abi: 'function allPools(uint256) view returns (address)',
    calls: indices,
  })

  const tokenXs = await api.multiCall({ abi: 'address:tokenX', calls: pools })
  const tokenYs = await api.multiCall({ abi: 'address:tokenY', calls: pools })

  const ownerTokens = pools.map((pool, i) => {
    const tokens = [...new Set([tokenXs[i], tokenYs[i], ...KNOWN].map((t) => t.toLowerCase()))]
    return [tokens, pool]
  })

  return api.sumTokens({ ownerTokens })
}

// Staked YRIS + any reward inventory (WETH/USDG) sitting in FeeStaking.
// Kept off main tvl so DEX liquidity is not inflated by the native token.
async function staking(api) {
  return api.sumTokens({
    owners: [FEE_STAKING],
    tokens: [YRIS, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG],
  })
}

module.exports = {
  methodology:
    'TVL is the ERC-20 balances held inside every BinPool enumerated by BinFactory.allPools on Robinhood Chain. Pools are the swap and LP entry point (there is no router). Empty factory slots contribute zero. Staking is YRIS (and any WETH/USDG reward inventory) held in FeeStaking — reported separately, not in DEX TVL. Treasury wallets are not included. Token prices come from DefiLlama; assets without a price (e.g. YRIS before listing) may under-report until priced.',
  start: 1788149794, // factory deploy 2026-08-31 04:16:34 UTC (tx 0x7710b875…b96368)
  robinhood: { tvl, staking },
}
