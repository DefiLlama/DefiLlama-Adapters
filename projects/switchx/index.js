const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Canonical SwitchX V4Factory on PulseChain.
const FACTORY = '0xeF72cbCcF4A807DfA1fbecd61DdB488fF8a05fa3'
const FROM_BLOCK = 26521466

const POOL_EVENT =
  'event Pool(address indexed token0, address indexed token1, address pool)'

const CUSTOM_POOL_EVENT =
  'event CustomPool(address indexed deployer, address indexed token0, address indexed token1, address pool)'

async function tvl(api) {
  const logConfig = {
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
  }

  const [standardPools, customPools] = await Promise.all([
    getLogs2({
      ...logConfig,
      eventAbi: POOL_EVENT,
      extraKey: 'standard-pools',
    }),
    getLogs2({
      ...logConfig,
      eventAbi: CUSTOM_POOL_EVENT,
      extraKey: 'custom-pools',
    }),
  ])

  const pools = [...standardPools, ...customPools]

  const ownerTokens = pools.map(({ token0, token1, pool }) => [
    [token0, token1],
    pool,
  ])

  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology:
    'Counts token0 and token1 balances held by every standard and custom liquidity pool created by the canonical SwitchX V4Factory on PulseChain. Pools are discovered from on-chain factory events, so newly created pools are included automatically.',
  start: '2026-05-13',
  pulse: {
    tvl,
  },
}
