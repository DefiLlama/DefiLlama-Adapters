const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// UNIHOOD launches every token into a Uniswap V4 pool governed by one global
// hook. The full 1B supply is placed as single-sided liquidity by the factory
// and there is no withdrawal path, so the ETH side of each pool is protocol TVL.
const FACTORY = '0x0485a4392b7300841e644bB1B36562AE7B2A0c82'
const HOOK = '0xec392C2b716C4B46df67cA6196ff92f7Dc2De8Cc'
const POOL_MANAGER = '0x8366a39CC670B4001A1121B8F6A443A643e40951'
const STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b'
const FROM_BLOCK = 26_604_126 // factory deploy

const SUPPLY = 1e9
const MIN_USABLE_TICK = -887_200 // full-range bound at tickSpacing 200
const sqrtAt = (tick) => 1.0001 ** (tick / 2)

const Launched =
  'event Launched(address indexed token, bytes32 indexed poolId, address indexed creator, string name, string symbol, string metaURI, int24 startTick, uint256 tokenLiquidity, uint256 devBuyNative, uint256 devBuyTokens)'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: Launched,
  })

  const slots = await api.multiCall({
    target: STATE_VIEW,
    abi: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
    calls: logs.map((i) => ({ params: [i.poolId] })),
  })

  // Native ETH sits inside the V4 singleton, so per-pool balances are not
  // readable directly. Each launch position is the fixed 1B supply over
  // [MIN_USABLE_TICK, startTick], which pins the pool's liquidity constant;
  // the ETH the pool has taken in follows from the current tick alone.
  let raisedEth = 0
  for (let i = 0; i < logs.length; i++) {
    const startTick = Number(logs[i].startTick)
    const sStart = sqrtAt(startTick)
    const liquidity = SUPPLY / (sStart - sqrtAt(MIN_USABLE_TICK))
    const tick = Math.max(MIN_USABLE_TICK, Math.min(startTick, Number(slots[i].tick)))
    const s = sqrtAt(tick)
    raisedEth += (liquidity * (sStart - s)) / (s * sStart)
  }
  api.add(ADDRESSES.null, Math.round(raisedEth * 1e18))

  // Fee ETH the hook still holds as ERC-6909 claims on the PoolManager:
  // pending bid wall budgets plus unclaimed creator and platform fees.
  const hookClaims = await api.call({
    target: POOL_MANAGER,
    abi: 'function balanceOf(address owner, uint256 id) view returns (uint256)',
    params: [HOOK, 0],
  })
  api.add(ADDRESSES.null, hookClaims)
}

module.exports = {
  methodology:
    'TVL is the ETH buyers have deposited into UNIHOOD launch pools (each pool holds its full token supply as locked single-sided liquidity, so the ETH side is computed from the pool tick and the fixed liquidity constant) plus ETH fee claims held by the UNIHOOD hook on the PoolManager, which fund the bid walls and unclaimed creator fees. Launched tokens themselves are not counted.',
  start: '2026-08-03',
  doublecounted: true,
  robinhood: { tvl },
}
