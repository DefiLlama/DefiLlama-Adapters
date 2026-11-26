const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4')

// DISCIPLE: bonding-curve coin launchpad on Robinhood Chain (4663). https://disciple.vip
// Each coin launches with its own BondingCurve clone that holds the quote (USDG or a pair token) paid in by buyers.
// When a curve fills it graduates: Migration moves the liquidity into a Uniswap v4 pool that runs the DISCIPLE hook,
// and the position is held for good by LockedLP. Addresses: https://disciple.vip/docs/reference/contracts
const LAUNCHPAD = '0xe43F360DC65C9Ba1B7a835BDaa10Fb31f6DC52E5'
const LOCKED_LP = '0xe3F8FeefF2ad0d6f4055cD90f91518C1331E1c4D'
const MIGRATION = '0x0fCD7FE98Eed9234A1d1c2aAb6AEec210809747b'
const TICK_SPACING = 60 // Migration.TICK_SPACING, every DISCIPLE pool uses it
const FROM_BLOCK = 118816228 // mainnet deploy block (2026-11-20)

// Pair coins not yet priced by their Robinhood Chain address: priced through their CoinGecko id instead.
const COINGECKO_IDS = {
  '0x168661c52e5922288dfb2b3f323b6cf90eb21e18': 'strategy-coin', // STRATEGY
}

const LAUNCHED = 'event Launched(address indexed token, address indexed curve, address indexed creator, address quote, string name, string ticker, uint256 creatorTaxBps)'
const MIGRATED = 'event Migrated(address indexed token, address indexed quote, bytes32 poolId, uint256 tokenAmount, uint256 quoteAmount, uint160 sqrtPriceX96)'

async function tvl(api) {
  const launches = await getLogs2({ api, target: LAUNCHPAD, eventAbi: LAUNCHED, fromBlock: FROM_BLOCK })

  // 1. Un-graduated curves: the quote each curve holds (graduation drains it into the v4 pool).
  const tokensAndOwners = launches.map((l) => [l.quote, l.curve])
  // 2. LockedLP: quote parked before graduation and the compound bucket waiting to be added to the pool.
  const quotes = [...new Set(launches.map((l) => l.quote.toLowerCase()))]
  quotes.forEach((q) => tokensAndOwners.push([q, LOCKED_LP]))
  await api.sumTokens({ tokensAndOwners })

  // 3. Graduated coins: reserves of their Uniswap v4 pools (liquidity sits in the shared PoolManager). Pools come from
  // Migration's Migrated events (one per graduated coin) rather than the PoolManager's Initialize logs: Robinhood Chain
  // has well over 10k Initialize events since our deploy, all from other pools.
  const migrations = await getLogs2({ api, target: MIGRATION, eventAbi: MIGRATED, fromBlock: FROM_BLOCK })
  const pools = migrations.map((m) => {
    const [token0, token1] = BigInt(m.token) < BigInt(m.quote) ? [m.token, m.quote] : [m.quote, m.token]
    return { id: m.poolId, token0, token1, spacing: TICK_SPACING }
  })
  await addUniV4PoolReserves({ api, pools, stateView: chainConfig.robinhood.stateView })

  // 4. Move pair coins without an on-chain price to their CoinGecko id.
  const balances = api.getBalances()
  for (const [token, cgId] of Object.entries(COINGECKO_IDS)) {
    const key = Object.keys(balances).find((k) => k.toLowerCase() === `robinhood:${token}`)
    const raw = key && balances[key]
    if (!raw) continue
    const decimals = await api.call({ abi: 'erc20:decimals', target: token })
    api.removeTokenBalance(token)
    api.addCGToken(cgId, Number(raw) / 10 ** Number(decimals))
  }
  return api.getBalances()
}

module.exports = {
  methodology:
    'Counts the quote tokens (USDG or the coin\'s pair token) held by every un-graduated DISCIPLE bonding curve, found from Launchpad Launched events, plus quote held by LockedLP before it is added to a pool. Graduated coins are counted from the reserves of their Uniswap v4 pools on the DISCIPLE hook, found from Migration Migrated events. Unsold launch tokens on the curves and unclaimed trading fees are not counted.',
  start: '2026-11-20',
  robinhood: { tvl },
}
