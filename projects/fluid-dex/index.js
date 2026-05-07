const DEX_RESOLVERS = {
  ethereum: "0x7af0C11F5c787632e567e6418D74e5832d8FFd4c",
  arbitrum: "0x1De42938De444d376eBc298E15D21F409b946E6D",
  polygon: "0xa17798d03bB563c618b9C44cAd937340Bad99138",
  base: "0xa3B18522827491f10Fc777d00E69B3669Bf8c1f8",
  plasma: "0x851ab045dFD8f3297a11401110d31Fa9191b0E04",
}

const NATIVE_TOKEN = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000"
const SHARE_PRECISION = 10n ** 18n

const STARTS = {
  ethereum: "2024-10-26",
  arbitrum: "2024-12-23",
  polygon: "2025-04-03",
  base: "2025-05-22",
  plasma: "2025-09-22",
}

const abi = {
  getAllDexAddresses: "function getAllDexAddresses() external view returns (address[] dexes_)",
  getDexTokens: "function getDexTokens(address dex_) external view returns (address token0_, address token1_)",
  getDexState:
    "function getDexState(address dex_) returns ((uint256 lastToLastStoredPrice, uint256 lastStoredPrice, uint256 centerPrice, uint256 lastUpdateTimestamp, uint256 lastPricesTimeDiff, uint256 oracleCheckPoint, uint256 oracleMapping, uint256 totalSupplyShares, uint256 totalBorrowShares, bool isSwapAndArbitragePaused, (bool isRangeChangeActive, bool isThresholdChangeActive, bool isCenterPriceShiftActive, (uint256 oldUpper, uint256 oldLower, uint256 duration, uint256 startTimestamp, uint256 oldTime) rangeShift, (uint256 oldUpper, uint256 oldLower, uint256 duration, uint256 startTimestamp, uint256 oldTime) thresholdShift, (uint256 shiftPercentage, uint256 duration, uint256 startTimestamp) centerPriceShift) shifts, uint256 token0PerSupplyShare, uint256 token1PerSupplyShare, uint256 token0PerBorrowShare, uint256 token1PerBorrowShare) state_)",
}

async function tvl(api) {
  const resolver = DEX_RESOLVERS[api.chain]
  const dexes = await api.call({ target: resolver, abi: abi.getAllDexAddresses })
  const [tokens, states] = await Promise.all([
    api.multiCall({ target: resolver, abi: abi.getDexTokens, calls: dexes }),
    api.multiCall({ target: resolver, abi: abi.getDexState, calls: dexes }),
  ])

  states.forEach((state, index) => {
    const totalSupplyShares = BigInt(state.totalSupplyShares || 0)
    if (!totalSupplyShares) return

    const { token0_, token1_ } = tokens[index]
    api.add(toDefiLlamaToken(token0_), supplyAmount(totalSupplyShares, state.token0PerSupplyShare))
    api.add(toDefiLlamaToken(token1_), supplyAmount(totalSupplyShares, state.token1PerSupplyShare))
  })

  return api.getBalances()
}

function toDefiLlamaToken(token) {
  return token.toLowerCase() === NATIVE_TOKEN ? NULL_ADDRESS : token
}

function supplyAmount(totalSupplyShares, tokenPerSupplyShare) {
  return ((totalSupplyShares * BigInt(tokenPerSupplyShare || 0)) / SHARE_PRECISION).toString()
}

module.exports = {
  methodology:
    "Counts Fluid DEX liquidity from Fluid's DexResolver state. For each DEX, TVL is totalSupplyShares multiplied by token0/token1 per supply share, with Fluid's native-token sentinel normalized to DefiLlama's native asset address. This child adapter is marked double-counted because Fluid DEX liquidity is sourced through Fluid's shared liquidity layer, which is also represented in Fluid Lending.",
  doublecounted: true,
}

Object.keys(DEX_RESOLVERS).forEach((chain) => {
  module.exports[chain] = {
    tvl,
    start: STARTS[chain],
  }
})
