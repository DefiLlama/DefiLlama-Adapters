const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0xe5bCa0eDe9208f7Ee7FCAFa0415Ca3DC03e16a90'
const POOL_MANAGER = '0x498581fF718922c3f8e6A244956aF099B2652b2b'

const eventAbi = 'event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 positionId, uint256 totalSupply, uint256 initialFdv, int24 tickLower, int24 tickUpper)'

async function tvl(api) {
  // Get all tokens created by PumpClaw factory
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: 25973600,
    eventAbi,
  })

  const tokens = logs.map(log => log.token)

  // PumpClaw tokens are exclusively paired with WETH in Uniswap V4 pools
  // LP positions are permanently locked in PumpClaw's LPLocker (0x6e4D241957074475741Ff42ec358b8b00217Bf5d)
  // We count PumpClaw token balances in the shared V4 PoolManager
  // Note: WETH is intentionally excluded because PoolManager is shared across
  // all V4 pools — summing WETH here would overcount. DefiLlama's pricing
  // layer values the PumpClaw tokens via their Uniswap V4 pool reserves.
  return api.sumTokens({ owner: POOL_MANAGER, tokens })
}

module.exports = {
  methodology: 'Counts the value of tokens locked in Uniswap V4 pools created by the PumpClaw factory. All LP positions are permanently locked.',
  start: 1769932905,
  base: { tvl },
}
