const { getLogs2 } = require('../helper/cache/getLogs')

// Diggers launchpad on Robinhood Chain (https://diggers.fun).
// One singleton contract is factory + swap router + sole LP of every launched token:
// each launch mints a fixed 1B supply and seeds ALL of it as single-sided liquidity
// in a hookless Uniswap V4 pool (ETH is currency0). Liquidity can never be removed.
// https://robinhoodchain.blockscout.com/address/0x4190a197e9c7c8D9ce1095c32e6666A13A996580
const DIGGERS = '0x4190a197e9c7c8D9ce1095c32e6666A13A996580'
const DEPLOY_BLOCK = 12296204

const CREATED_EVENT =
  'event Created(address indexed token, address indexed creator, string name, string symbol, string metadataURI, bytes32 poolId, uint160 startSqrtPriceX96, uint24 poolFee, uint128 burnShareWad)'

// Per-pool reserves attributable to the Diggers position inside the shared
// Uniswap V4 PoolManager singleton, computed on-chain from slot0 + liquidity.
const POOL_STATE_ABI =
  'function poolState(address token) view returns (uint160 sqrtPriceX96, int24 tick, uint128 liquidity, uint256 ethInPool, uint256 tokenInPool)'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: DIGGERS,
    eventAbi: CREATED_EVENT,
    fromBlock: DEPLOY_BLOCK,
  })
  const tokens = logs.map((log) => log.token)
  if (!tokens.length) return

  const states = await api.multiCall({ abi: POOL_STATE_ABI, target: DIGGERS, calls: tokens })
  for (let i = 0; i < tokens.length; i++) {
    // ETH side of the pool (currency0). The token side is the launched meme
    // token itself and is deliberately not counted (unpriced own-supply).
    api.addGasToken(states[i].ethInPool)
  }

  // ETH escrowed on the launchpad: harvested-but-unclaimed creator/team fees
  // (pull-payment model) and pending initial-buy distributions.
  await api.sumTokens({ owner: DIGGERS, tokens: [require('../helper/coreAssets.json').null] })
}

module.exports = {
  methodology:
    'TVL is the ETH side of every Diggers pool, read on-chain via the launchpad`s poolState() view (Diggers is the only LP of each Uniswap V4 pool it creates, and liquidity is locked forever), plus ETH held by the launchpad awaiting pull-payment fee claims. Launched tokens themselves are not counted.',
  doublecounted: true, // pools live inside the canonical Uniswap V4 PoolManager, so this ETH is also part of Uniswap TVL
  robinhood: {
    tvl,
  },
}
