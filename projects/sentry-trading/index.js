const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Sentry Launch Factory on Robinhood Chain: a token launchpad that
// deploys ERC-20s, seeds a Uniswap V3 pool (token/WETH, 1% tier), and
// permanently locks the LP NFT inside the factory. TVL is the liquidity
// in those factory-created pools.
const FACTORY = '0x9e8f6f8214b01Fd4Cf1d73FB1fb7cf9f811036Cb'
const WETH = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
const FACTORY_DEPLOY_BLOCK = 1431636

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    eventAbi: 'event PoolInitialized(address indexed pool, address indexed token)',
    onlyArgs: true,
    fromBlock: FACTORY_DEPLOY_BLOCK,
  })
  const ownerTokens = logs.map((log) => [[log.token, WETH], log.pool])
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the liquidity held in the Uniswap V3 pools created by the Sentry Launch Factory (pools are enumerated from the factory\'s PoolInitialized events; every pool is a token/WETH pair whose LP position is permanently locked in the factory).',
  start: '2026-07-02',
  robinhood: { tvl },
}
