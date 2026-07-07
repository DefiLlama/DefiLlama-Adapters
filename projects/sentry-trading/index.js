const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const FACTORY = '0x9e8f6f8214b01Fd4Cf1d73FB1fb7cf9f811036Cb'
const WETH = ADDRESSES.robinhood.WETH
const FACTORY_DEPLOY_BLOCK = 1431636

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    eventAbi: 'event PoolInitialized(address indexed pool, address indexed token)',
    fromBlock: FACTORY_DEPLOY_BLOCK,
  })
  const owners = logs.map((log) => log.pool)
  return sumTokens2({ api, owners, tokens: [WETH] })
}

module.exports = {
  methodology: 'TVL is the WETH held in the Uniswap V3 pools created by the Sentry Launch Factory (pools are enumerated from the factory\'s PoolInitialized events; every pool is a token/WETH pair whose LP position is permanently locked in the factory).',
  start: '2026-07-02',
  robinhood: { tvl },
}
