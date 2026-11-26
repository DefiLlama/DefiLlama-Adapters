const { getLogs2 } = require('../helper/cache/getLogs')
const { getHookPools, addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4')

// DISCIPLE: bonding-curve coin launchpad on Robinhood Chain (4663). https://disciple.vip
// Each coin launches with its own BondingCurve clone that holds the quote (USDG or a pair token) paid in by buyers.
// When a curve fills it graduates: Migration moves the liquidity into a Uniswap v4 pool that runs the DISCIPLE hook,
// and the position is held for good by LockedLP. Addresses: https://disciple.vip/docs/reference/contracts
const LAUNCHPAD = '0xe43F360DC65C9Ba1B7a835BDaa10Fb31f6DC52E5'
const LOCKED_LP = '0xe3F8FeefF2ad0d6f4055cD90f91518C1331E1c4D'
const HOOK = '0xF681588d62C3cf2e8e0659887130fa7Ea35c6044'
const FROM_BLOCK = 118816228 // mainnet deploy block (2026-11-20)

const LAUNCHED = 'event Launched(address indexed token, address indexed curve, address indexed creator, address quote, string name, string ticker, uint256 creatorTaxBps)'

async function tvl(api) {
  const launches = await getLogs2({ api, target: LAUNCHPAD, eventAbi: LAUNCHED, fromBlock: FROM_BLOCK })

  // 1. Un-graduated curves: the quote each curve holds (graduation drains it into the v4 pool).
  const tokensAndOwners = launches.map((l) => [l.quote, l.curve])
  // 2. LockedLP: quote parked before graduation and the compound bucket waiting to be added to the pool.
  const quotes = [...new Set(launches.map((l) => l.quote.toLowerCase()))]
  quotes.forEach((q) => tokensAndOwners.push([q, LOCKED_LP]))
  await api.sumTokens({ tokensAndOwners })

  // 3. Graduated coins: reserves of every Uniswap v4 pool on the DISCIPLE hook (liquidity sits in the PoolManager).
  const { poolManager, fromBlock, stateView } = chainConfig.robinhood
  const pools = await getHookPools({ api, hook: HOOK, poolManager, fromBlock })
  await addUniV4PoolReserves({ api, pools, stateView })
  return api.getBalances()
}

module.exports = {
  methodology:
    'Counts the quote tokens (USDG or the coin\'s pair token) held by every un-graduated DISCIPLE bonding curve, found from Launchpad Launched events, plus quote held by LockedLP before it is added to a pool. Graduated coins are counted from the reserves of their Uniswap v4 pools on the DISCIPLE hook. Unsold launch tokens on the curves and unclaimed trading fees are not counted.',
  start: '2026-11-20',
  robinhood: { tvl },
}
