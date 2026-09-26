const { getLogs2 } = require('../helper/cache/getLogs')

const POOL_MANAGER = '0x6E4723A612831AfB9f5B2a5aE22723c37aAB9560'

const abi = {
  Initialize: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)',
}

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: POOL_MANAGER,
    fromBlock: 54652108,
    eventAbi: abi.Initialize,
  })

  const tokens = new Set()
  logs.forEach(({ currency0, currency1 }) => {
    tokens.add(currency0)
    tokens.add(currency1)
  })

  return api.sumTokens({ owner: POOL_MANAGER, tokens: [...tokens] })
}

module.exports = {
  methodology: 'TVL is the balance of every pool currency held by the Calamari PoolManager singleton on Ink. Pool currencies are discovered from the Initialize events emitted by the PoolManager.',
  start: '2026-08-31',
  ink: { tvl },
}
