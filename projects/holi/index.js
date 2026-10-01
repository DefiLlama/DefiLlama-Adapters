const { sumTokens2 } = require('../helper/unwrapLPs')

const PRE_GENESIS_FARM = '0x58711b4AA9cc0730b3602C29299f6cfCA23b6337'

const abi = {
  poolCount: 'function poolCount() view returns (uint256)',
  pools: 'function pools(uint256) view returns (address token, uint8 quote, bool allowlistOnly, uint16 depositFeeBps, uint256 totalDeposited, uint64 startedAt)',
}

async function tvl(api) {
  const poolCount = await api.call({ target: PRE_GENESIS_FARM, abi: abi.poolCount })
  const pools = await api.multiCall({
    target: PRE_GENESIS_FARM,
    abi: abi.pools,
    calls: Array.from({ length: Number(poolCount) }, (_, i) => i),
    permitFailure: true,
  })

  const tokens = [...new Set(pools.map(pool => pool?.token).filter(Boolean))]
  return sumTokens2({ api, owner: PRE_GENESIS_FARM, tokens, permitFailure: true })
}

module.exports = {
  methodology: 'TVL is the value of ERC-20 assets deposited into Holi Pre-Genesis Farm on Robinhood Chain.',
  start: '2026-09-29',
  robinhood: { tvl },
}
