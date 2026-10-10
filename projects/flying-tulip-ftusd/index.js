const { sumTokens2 } = require('../helper/unwrapLPs')

const MINT_AND_REDEEM = {
  ethereum: '0xaa48ecbc843cf7e9a29155d112b8cb27902bd23c',
  sonic: '0x0c6f8ec81c3ea5bff06f6cd0791780f9f050ee31',
  bsc: '0x7d73863178a3ecb9767f0be1bf50f55305a52743',
}

const COLLATERAL_INFO_ABI =
  'function collateralInfo(address) view returns (tuple(address yieldWrapper, uint8 decimals, bool enabled, uint16 mintFeeBps, uint16 redeemFeeBps, uint256 maxValueFtUSD, uint256 mintPriceHardcapWad, uint256 totalIn, uint256 totalOut, uint256 totalFtUSDBurned, uint256 totalFtUSDMinted))'

async function tvl(api) {
  const mr = MINT_AND_REDEEM[api.chain]
  const collaterals = await api.fetchList({
    target: mr,
    lengthAbi: 'uint256:collateralCount',
    itemAbi: 'function collateralAt(uint256) view returns (address)',
  })
  const wrappers = (await api.multiCall({ target: mr, abi: COLLATERAL_INFO_ABI, calls: collaterals }))
    .map(i => i.yieldWrapper)

  const strategyLists = await Promise.all(wrappers.map(target => api.fetchList({
    target,
    lengthAbi: 'uint256:numberOfStrategies',
    itemAbi: 'function strategies(uint256) view returns (address)',
  })))
  const flat = strategyLists.flatMap((strats, i) => strats.map(strategy => ({ strategy, collateral: collaterals[i] })))

  const [positions, underlyings] = await Promise.all([
    api.multiCall({ abi: 'address:positionToken', calls: flat.map(s => ({ target: s.strategy })), permitFailure: true }),
    api.multiCall({ abi: 'address:token',         calls: flat.map(s => ({ target: s.strategy })), permitFailure: true }),
  ])

  // idle collateral held by each wrapper and by each of its strategies
  const tokensAndOwners = [
    ...collaterals.map((c, i) => [c, wrappers[i]]),
    ...flat.map(s => [s.collateral, s.strategy]),
  ]
  // external yield receipts (aToken, spToken): positionToken != token.
  // Flying Tulip Delta-Neutral strategies supply into Flying Tulip Lend, which the
  // flying-tulip-lend adapter already counts, so their shares are skipped here.
  // Deprecated strategies revert both calls and are skipped too.
  flat.forEach((s, i) => {
    if (!positions[i] || !underlyings[i]) return
    if (positions[i].toLowerCase() !== underlyings[i].toLowerCase()) tokensAndOwners.push([positions[i], s.strategy])
  })

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'Sums the collateral backing ftUSD that sits outside Flying Tulip Lend: idle collateral held by each MintAndRedeem-registered ftYieldWrapperV2 and its strategies, plus external yield receipts (Aave, Spark) held by the wrapper strategies. Backing that the Flying Tulip Delta-Neutral strategies supply into Flying Tulip Lend is counted once, under flying-tulip-lend.',
  ethereum: { tvl },
  sonic: { tvl },
  bsc: { tvl },
}
