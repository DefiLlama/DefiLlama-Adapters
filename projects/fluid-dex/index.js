const config = {
  ethereum: { resolver: '0x7af0C11F5c787632e567e6418D74e5832d8FFd4c', start: '2024-10-26'},
  arbitrum: { resolver: '0x1De42938De444d376eBc298E15D21F409b946E6D', start: '2024-12-23'},
  polygon: { resolver: '0xa17798d03bB563c618b9C44cAd937340Bad99138', start: '2025-04-03'},
  base: { resolver: '0xa3B18522827491f10Fc777d00E69B3669Bf8c1f8', start: '2025-05-22'},
  plasma: { resolver: '0x851ab045dFD8f3297a11401110d31Fa9191b0E04', start: '2025-09-22'},
}

const abi = {
  getAllDexAddresses: "function getAllDexAddresses() external view returns (address[] dexes_)",
  getDexTokens: "function getDexTokens(address dex_) external view returns (address token0_, address token1_)",
  getDexCollateralReserves: "function getDexCollateralReserves(address dex_) external view returns ((uint256 token0RealReserves, uint256 token1RealReserves, uint256 token0ImaginaryReserves, uint256 token1ImaginaryReserves) reserves_)",
}

async function tvl(api) {
  const { resolver } = config[api.chain]
  const dexes = await api.call({ target: resolver, abi: abi.getAllDexAddresses })
  const [tokens, reserves] = await Promise.all([
    api.multiCall({ target: resolver, abi: abi.getDexTokens, calls: dexes }),
    api.multiCall({ target: resolver, abi: abi.getDexCollateralReserves, calls: dexes }),
  ])

  reserves.forEach((r, i) => {
    const { token0_, token1_ } = tokens[i]
    api.add(token0_, r.token0RealReserves)
    api.add(token1_, r.token1RealReserves)
  })
}

module.exports = {
  methodology:
    "Counts Fluid DEX liquidity by reading each DEX's collateral reserves directly from DexResolver.getDexCollateralReserves(). token0RealReserves and token1RealReserves are the actual tokens held in Fluid's shared Liquidity layer per DEX. This child adapter is marked double-counted because Fluid DEX liquidity is sourced through Fluid's shared liquidity layer, which is also represented in Fluid Lending.",
  doublecounted: true,
}

Object.keys(config).forEach((chain) => {
  const { start } = config[chain]
  module.exports[chain] = {
    tvl,
    start,
  }
})
