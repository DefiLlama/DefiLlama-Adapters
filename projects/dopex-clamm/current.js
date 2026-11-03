const { getLogs } = require('../helper/cache/getLogs')
const { getSqrtPriceX96AtTick } = require('../helper/utils/tick')
const { solidityPackedKeccak256 } = require('ethers')

// Current CLAMM configuration published by https://clamm.stryke.xyz/en/earn.
// FeeStrategy registrations discover current AND retired markets; holder wallets
// and the full balances of the underlying AMM pools are not protocol TVL.
const config = {
  robinhood: {
    // FeeStrategy deployment, including the registration scan's first block:
    // https://robinhoodchain.blockscout.com/tx/0xe2b2282f4356c3653cf07d106b6fae2f499c793c1d89cf7ebf37f8fed8acffb0
    feeStrategy: '0x56b8221882e4707f998f3e9717fbdfde628ed1b2',
    fromBlock: 65228887,
    start: '2026-09-17',
    handlers: [
      { address: '0x67599652ec14f635837929b4c08b1adc10f83300', fromBlock: 65228887 },
      // UP V3 pools use Slipstream's extra stakedLiquidityNet tick field:
      // https://robinhoodchain.blockscout.com/address/0x11725976BF1F38c4aB78d1F480bc5883d70D9dc3?tab=contract
      { address: '0x02a81b0eb603d1e228c4f3e5ed756e8b6ee64f11', fromBlock: 68671942, slipstream: true },
    ],
  },
  // Verified Arbitrum FeeStrategy and handler; current SDK market configuration:
  // https://github.com/stryke-xyz/sdk/blob/main/src/markets/index.ts
  arbitrum: {
    // FeeStrategy deployment, including the registration scan's first block:
    // https://arbitrum.blockscout.com/tx/0xc9251017549f4a7fccdf06423044d3328dc29bcd5c8ee138c653843da0cde8fd
    feeStrategy: '0x11d27d84e21dc88eb8c8aef3a1f9b869b5f95a87',
    fromBlock: 379445413,
    start: '2025-09-15',
    handlers: [
      { address: '0x6f73afb6598d7a3881577f884f2e01574aefc373', fromBlock: 379716358 },
    ],
  },
}
// ABI: https://github.com/stryke-xyz/sdk/blob/main/src/abi/V3BaseHandlerAbi.ts
const mintEvent = 'event LogMintPositionHandler((address pool,address hook,int24 tickLower,int24 tickUpper,uint128 liquidity) params,address context,uint256 amount0,uint256 amount1)'

async function tvl(api) {
  const { feeStrategy, fromBlock, handlers } = config[api.chain]
  if (await api.getBlock() < fromBlock) return
  const registered = await getLogs({ api, target: feeStrategy, fromBlock,
    eventAbi: 'event OptionMarketRegistered(address optionMarket)', onlyArgs: true })
  const markets = [...new Set(registered.map(l => l.optionMarket.toLowerCase()))]
  if (!markets.length) return
  const pools = await api.multiCall({ abi: 'address:primePool', calls: markets })
  const callAssets = await api.multiCall({ abi: 'address:callAsset', calls: markets })
  const putAssets = await api.multiCall({ abi: 'address:putAsset', calls: markets })
  const allowedPools = new Set(pools.map(p => p.toLowerCase()))
  const positions = new Map()
  for (const { address: handler, fromBlock, slipstream = false } of handlers) {
    if (await api.getBlock() < fromBlock) continue
    const logs = await getLogs({ api, target: handler, fromBlock, eventAbi: mintEvent, onlyArgs: true })
    for (const { params: p } of logs) {
      if (!allowedPools.has(p.pool.toLowerCase())) continue
      // Hooks have separate handler shares, but share one underlying AMM position.
      const key = solidityPackedKeccak256(['address', 'int24', 'int24'], [handler, p.tickLower, p.tickUpper])
      positions.set(p.pool.toLowerCase() + ':' + key, { pool: p.pool, key, lower: Number(p.tickLower), upper: Number(p.tickUpper), slipstream })
    }
  }
  const rows = [...positions.values()]
  const states = await api.multiCall({ abi: 'function positions(bytes32) view returns (uint128 liquidity,uint256 feeGrowthInside0LastX128,uint256 feeGrowthInside1LastX128,uint128 tokensOwed0,uint128 tokensOwed1)', calls: rows.map(p => ({ target: p.pool, params: [p.key] })) })
  const uniquePools = [...new Set(rows.map(p => p.pool))]
  // Read the common prefix: UP V3 uses a different trailing feeProtocol type.
  const prices = await api.multiCall({ abi: 'function slot0() view returns (uint160 sqrtPriceX96,int24 tick)', calls: uniquePools })
  const token0 = await api.multiCall({ abi: 'address:token0', calls: uniquePools })
  const token1 = await api.multiCall({ abi: 'address:token1', calls: uniquePools })
  const global0 = await api.multiCall({ abi: 'uint256:feeGrowthGlobal0X128', calls: uniquePools })
  const global1 = await api.multiCall({ abi: 'uint256:feeGrowthGlobal1X128', calls: uniquePools })
  const poolInfo = Object.fromEntries(uniquePools.map((p, i) => [p, { price: BigInt(prices[i].sqrtPriceX96), tick: Number(prices[i].tick), token0: token0[i], token1: token1[i], growth: [BigInt(global0[i]), BigInt(global1[i])] }]))
  // Zero-liquidity positions can retain recorded fees, but earn no new fees.
  const ticks = new Map()
  rows.forEach((p, i) => {
    if (!BigInt(states[i].liquidity)) return
    for (const tick of [p.lower, p.upper]) ticks.set(p.pool + ':' + tick, { target: p.pool, params: [tick], slipstream: p.slipstream })
  })
  const outside = {}
  for (const slipstream of [false, true]) {
    const group = [...ticks.entries()].filter(([, p]) => p.slipstream === slipstream)
    if (!group.length) continue
    const abi = `function ticks(int24) view returns (uint128 liquidityGross,int128 liquidityNet,${slipstream ? 'int128 stakedLiquidityNet,' : ''}uint256 feeGrowthOutside0X128,uint256 feeGrowthOutside1X128)`
    const tickStates = await api.multiCall({ abi, calls: group.map(([, { target, params }]) => ({ target, params })) })
    group.forEach(([key], i) => { outside[key] = [BigInt(tickStates[i].feeGrowthOutside0X128), BigInt(tickStates[i].feeGrowthOutside1X128)] })
  }
  const q96 = 1n << 96n
  rows.forEach((p, i) => {
    const info = poolInfo[p.pool], state = states[i], liquidity = BigInt(state.liquidity)
    const lower = getSqrtPriceX96AtTick(p.lower), upper = getSqrtPriceX96AtTick(p.upper)
    const price = info.price < lower ? lower : info.price > upper ? upper : info.price
    const amount0 = liquidity * q96 * (upper - price) / upper / price
    const amount1 = liquidity * (price - lower) / q96
    // Actual remaining pool liquidity excludes liquidity removed for options.
    // Match Uniswap V3 Tick.getFeeGrowthInside and Position.update, including
    // uint256 fee-growth wraparound and uint128 tokensOwed arithmetic:
    // https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/Tick.sol
    // https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/Position.sol
    const fees = [0, 1].map(t => {
      let pending = 0n
      if (liquidity) {
        const global = info.growth[t]
        const lowerOutside = outside[p.pool + ':' + p.lower][t], upperOutside = outside[p.pool + ':' + p.upper][t]
        const below = info.tick >= p.lower ? lowerOutside : global - lowerOutside
        const above = info.tick < p.upper ? upperOutside : global - upperOutside
        const delta = BigInt.asUintN(256, global - below - above - BigInt(state[`feeGrowthInside${t}LastX128`]))
        pending = delta * liquidity / (1n << 128n)
      }
      return BigInt.asUintN(128, BigInt(state[`tokensOwed${t}`]) + pending)
    })
    api.add(info.token0, (amount0 + fees[0]).toString())
    api.add(info.token1, (amount1 + fees[1]).toString())
  })
  // Include backing/settlement cash still held by the option markets once.
  await api.sumTokens({ ownerTokens: markets.map((market, i) => [[callAssets[i], putAssets[i]], market]) })
}

module.exports = Object.fromEntries(Object.entries(config).map(([chain, { start }]) => [chain, { start, tvl }]))
