const { getLogs2 } = require('../helper/cache/getLogs')

/** @constant {string} FACTORY - PumpClaw factory contract on Base that emits TokenCreated events */
const FACTORY = '0xe5bCa0eDe9208f7Ee7FCAFa0415Ca3DC03e16a90'

/** @constant {string} POOL_MANAGER - Uniswap V4 PoolManager on Base, holds all pool liquidity */
const POOL_MANAGER = '0x498581fF718922c3f8e6A244956aF099B2652b2b'

/** @constant {string} eventAbi - ABI for the TokenCreated event emitted by the PumpClaw factory */
const eventAbi = 'event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 positionId, uint256 totalSupply, uint256 initialFdv, int24 tickLower, int24 tickUpper)'

/**
 * Calculates PumpClaw TVL by summing token balances held in the Uniswap V4 PoolManager.
 * PumpClaw deploys full-range LP positions on Uniswap V4 with LP permanently locked.
 * WETH is excluded because PoolManager is shared across all V4 pools (would overcount).
 * @param {object} api - DefiLlama SDK API object with getLogs2 and sumTokens helpers
 * @returns {Promise<object>} Token balances held in PoolManager for all PumpClaw tokens
 */
async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: 25973600,
    eventAbi,
  })

  const tokens = logs.map(log => log.token)

  return api.sumTokens({ owner: POOL_MANAGER, tokens })
}

module.exports = {
  methodology: 'Counts the value of tokens locked in Uniswap V4 pools created by the PumpClaw factory. All LP positions are permanently locked.',
  start: 1769932905,
  base: { tvl },
}
