const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4')

// https://disciple.vip/docs/reference/contracts
const LAUNCHPAD = '0xe43F360DC65C9Ba1B7a835BDaa10Fb31f6DC52E5'
const LOCKED_LP = '0xe3F8FeefF2ad0d6f4055cD90f91518C1331E1c4D'
const MIGRATION = '0x0fCD7FE98Eed9234A1d1c2aAb6AEec210809747b'
const TICK_SPACING = 60 // Migration.TICK_SPACING
const FROM_BLOCK = 118816228

const LAUNCHED = 'event Launched(address indexed token, address indexed curve, address indexed creator, address quote, string name, string ticker, uint256 creatorTaxBps)'
const MIGRATED = 'event Migrated(address indexed token, address indexed quote, bytes32 poolId, uint256 tokenAmount, uint256 quoteAmount, uint160 sqrtPriceX96)'

async function tvl(api) {
  const launches = await getLogs2({ api, target: LAUNCHPAD, eventAbi: LAUNCHED, fromBlock: FROM_BLOCK })
  const tokensAndOwners = launches.map((l) => [l.quote, l.curve])
  const quotes = [...new Set(launches.map((l) => l.quote.toLowerCase()))]
  quotes.forEach((q) => tokensAndOwners.push([q, LOCKED_LP]))
  await api.sumTokens({ tokensAndOwners })

  const migrations = await getLogs2({ api, target: MIGRATION, eventAbi: MIGRATED, fromBlock: FROM_BLOCK })
  const pools = migrations.map((m) => {
    const [token0, token1] = BigInt(m.token) < BigInt(m.quote) ? [m.token, m.quote] : [m.quote, m.token]
    return { id: m.poolId, token0, token1, spacing: TICK_SPACING }
  })
  // graduated pools: quote side only, launched coins are not counted
  const launched = new Set(launches.map((l) => l.token.toLowerCase()))
  const quoteSide = { multiCall: (...args) => api.multiCall(...args), add: (token, amount) => { if (!launched.has(token.toLowerCase())) api.add(token, amount) } }
  await addUniV4PoolReserves({ api: quoteSide, pools, stateView: chainConfig.robinhood.stateView })
}

module.exports = {
  doublecounted: true, // graduated pools sit in the Uniswap v4 PoolManager, also counted by uniswap-v4
  methodology:
    'Counts the quote tokens (USDG or the coin\'s pair token) held by every DISCIPLE bonding curve, found from Launchpad Launched events, plus quote held by LockedLP before it is added to a pool. For graduated coins it counts the quote side of their Uniswap v4 pools, found from Migration Migrated events. Launched coins are not counted.',
  start: '2026-11-20',
  robinhood: { tvl },
}
