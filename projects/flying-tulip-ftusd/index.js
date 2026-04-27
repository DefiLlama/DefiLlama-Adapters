// Flying Tulip ftUSD is a stablecoin backed by yield-wrapped collateral.
// MintAndRedeem -> ftYieldWrapperV2 (one per underlying) -> one or
// more IStrategy contracts (Aave, Spark, Delta-Neutral, etc). Every strategy
// exposes positionToken() returning the receipt it holds (aToken,
// spToken, etc). For strategies whose positionToken equals their own
// underlying (e.g. Flying Tulip's Delta-Neutral strategy, which routes funds
// through downstream wrappers), we instead count the strategy shares held by
// the parent wrapper (priced 1:1 with the underlying).

const { sumTokens2 } = require('../helper/unwrapLPs')

const MINT_AND_REDEEM = {
  ethereum: '0xaa48ecbc843cf7e9a29155d112b8cb27902bd23c',
  sonic: '0x0c6f8ec81c3ea5bff06f6cd0791780f9f050ee31',
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
  const flat = strategyLists.flatMap((strats, i) => strats.map(strategy => ({ strategy, wrapper: wrappers[i] })))
  console.log("flat:", flat)

  const [positions, underlyings] = await Promise.all([
    api.multiCall({ abi: 'address:positionToken', calls: flat.map(s => ({ target: s.strategy })) }),
    api.multiCall({ abi: 'address:token',         calls: flat.map(s => ({ target: s.strategy })) }),
  ])

  // positionToken != token -> external, DL-priced receipt (aToken, spToken)
  // positionToken == token -> ft strategy (e.g. Delta-Neutral)
  const tokensAndOwners = flat.map((s, i) => positions[i].toLowerCase() !== underlyings[i].toLowerCase()
    ? [positions[i], s.strategy]
    : [s.strategy, s.wrapper]
  )

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'Sums collateral backing ftUSD by enumerating each MintAndRedeem-registered ftYieldWrapperV2 and reading positionToken() on each of their strategies. External-receipt strategies (Aave, Spark) contribute the receipt balance at the strategy address. Other strategies (Flying Tulip Delta-Neutral) contribute their strategy shares held by the parent wrapper, priced server-side at 1:1 with the underlying asset.',
  ethereum: { tvl },
  sonic: { tvl },
}
