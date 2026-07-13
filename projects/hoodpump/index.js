const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const LAUNCHPAD = '0x778F7b2d844B7C366b386d8Ce62110ceA301C777'
const LAUNCHPAD_DEPLOYMENT_BLOCK = 6990219
const WETH = ADDRESSES.robinhood.WETH

async function tvl(api) {
  const launches = await getLogs2({
    api,
    target: LAUNCHPAD,
    eventAbi: 'event LaunchCreated(uint256 indexed launchId, address indexed token, address indexed creator, address pool, uint256 positionTokenId, uint256 initialBuyWeth, uint256 initialTokensOut, string name, string symbol)',
    fromBlock: LAUNCHPAD_DEPLOYMENT_BLOCK,
  })

  const pools = launches.map((launch) => launch.pool)
  return sumTokens2({ api, owners: pools, tokens: [WETH] })
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the WETH held in Uniswap V3 pools created by the HoodPump Launchpad. Every pool is discovered from the factory\'s LaunchCreated events, and its liquidity position is permanently held by the HoodPump Liquidity Locker. Only WETH is counted; HoodPump-launched tokens are excluded.',
  start: '2026-07-11',
  robinhood: { tvl },
}
