const { sumTokens2 } = require('../helper/unwrapLPs')

const MINT_AND_REDEEM = {
  ethereum: '0xaa48ecbc843cf7e9a29155d112b8cb27902bd23c',
  sonic: '0x0c6f8ec81c3ea5bff06f6cd0791780f9f050ee31',
  bsc: '0x7d73863178a3ecb9767f0be1bf50f55305a52743',
}

// Flying Tulip Delta-Neutral strategy on each chain and the Flying Tulip Lend position manager it
// supplies into. Its ftUSD backing sits in Lend, read as the strategy's position there. The same
// list is in flying-tulip-lend, which subtracts these positions so they are counted once.
// positionToken() and token() revert on the Ethereum strategy when called through multicall, so the
// strategy is listed here rather than detected.
const DELTA_NEUTRAL = {
  ethereum: { strategy: '0xe0E445967256EE60111e243e0F0F94DD1D351A59', positionManager: '0xbe4050a73a7Fb384c65E885a15C33461A4B20055' },
  sonic: { strategy: '0x6EC218FC45aC0C7B83D16557befABB62ed7455Ae', positionManager: '0xbe4050a73a7Fb384c65E885a15C33461A4B20055' },
  bsc: { strategy: '0x7eF4ED045E693E10E6ed08ac71438b661f09817A', positionManager: '0xB36d39C72d66153B7f32E1320BEe3280657353Bd' },
}

const COLLATERAL_INFO_ABI =
  'function collateralInfo(address) view returns (tuple(address yieldWrapper, uint8 decimals, bool enabled, uint16 mintFeeBps, uint16 redeemFeeBps, uint256 maxValueFtUSD, uint256 mintPriceHardcapWad, uint256 totalIn, uint256 totalOut, uint256 totalFtUSDBurned, uint256 totalFtUSDMinted))'
const GET_BALANCE_ABI = 'function getBalance(address user, address asset) view returns (uint256 avail, uint256 holdBal)'

async function tvl(api) {
  const mr = MINT_AND_REDEEM[api.chain]
  const dn = DELTA_NEUTRAL[api.chain]
  const collaterals = await api.fetchList({
    target: mr,
    lengthAbi: 'uint256:collateralCount',
    itemAbi: 'function collateralAt(uint256) view returns (address)',
  })
  const wrappers = (await api.multiCall({ target: mr, abi: COLLATERAL_INFO_ABI, calls: collaterals }))
    .map(i => i.yieldWrapper)

  // idle collateral held by each wrapper and by each of its strategies
  const tokensAndOwners = collaterals.map((collateral, i) => [collateral, wrappers[i]])
  const dnCollaterals = []
  const external = []
  for (let i = 0; i < wrappers.length; i++) {
    const strategies = await api.fetchList({
      target: wrappers[i],
      lengthAbi: 'uint256:numberOfStrategies',
      itemAbi: 'function strategies(uint256) view returns (address)',
    })
    for (const strategy of strategies) {
      tokensAndOwners.push([collaterals[i], strategy])
      if (strategy.toLowerCase() === dn.strategy.toLowerCase()) dnCollaterals.push(collaterals[i])
      else external.push(strategy)
    }
  }

  // Delta-Neutral backing supplied into Flying Tulip Lend
  const dnPositions = await api.multiCall({
    target: dn.positionManager,
    abi: GET_BALANCE_ABI,
    calls: dnCollaterals.map(token => ({ params: [dn.strategy, token] })),
  })
  dnPositions.forEach((p, i) => api.add(dnCollaterals[i], BigInt(p.avail) + BigInt(p.holdBal)))

  // external yield receipts (aToken, spToken) held by the other strategies
  const positions = await api.multiCall({ abi: 'address:positionToken', calls: external })
  const underlyings = await api.multiCall({ abi: 'address:token', calls: external })
  external.forEach((strategy, i) => {
    if (positions[i].toLowerCase() === underlyings[i].toLowerCase())
      throw new Error(`flying-tulip-ftusd: strategy ${strategy} has no receipt token, add it to DELTA_NEUTRAL or handle it`)
    tokensAndOwners.push([positions[i], strategy])
  })

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'Sums the collateral backing ftUSD across each MintAndRedeem-registered ftYieldWrapperV2: idle collateral held by the wrappers and their strategies, external yield receipts (Aave, Spark) held by the strategies, and the Flying Tulip Delta-Neutral strategy\'s full position in Flying Tulip Lend, read from the Lend position manager. flying-tulip-lend subtracts that position, so it is counted once.',
  ethereum: { tvl },
  sonic: { tvl },
  bsc: { tvl },
}
