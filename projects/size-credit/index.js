const SIZE_FACTORY = {
  base: '0x330Dc31dB45672c1F565cf3EC91F9a01f8f3DF0b',
  ethereum: '0x3A9C05c3Da48E6E26f39928653258D7D4Eb594C1'
}

const abis = {
  SizeFactory: {
    getMarkets: 'function getMarkets() view returns (address[])',
  },
  Size: {
    data: 'function data() view returns (uint256 nextDebtPositionId,uint256 nextCreditPositionId,address underlyingCollateralToken,address underlyingBorrowToken,address collateralToken,address borrowAToken,address debtToken,address variablePool)',
  },
  Pool: {
    getReserveData: 'function getReserveData(address asset) view returns (uint256 configuration,uint128 liquidityIndex,uint128 currentLiquidityRate,uint128 variableBorrowIndex,uint128 currentVariableBorrowRate,uint128 currentStableBorrowRate,uint40 lastUpdateTimestamp,uint16 id,address aTokenAddress,address stableDebtTokenAddress,address variableDebtTokenAddress,address interestRateStrategyAddress,uint128 accruedToTreasury,uint128 unbacked,uint128 isolationModeTotalDebt)'
  }
}

async function tvl(api, chain) {
  const markets = await api.call({ abi: abis.SizeFactory.getMarkets, target: SIZE_FACTORY[chain] })
  const datas = await api.multiCall({ abi: abis.Size.data, calls: markets })

  const borrowATokens = datas.map(data => data.borrowAToken)
  const variablePools = datas.map(data => data.variablePool)
  const underlyingBorrowTokens = datas.map(data => data.underlyingBorrowToken)
  const underlyingCollateralTokens = datas.map(data => data.underlyingCollateralToken)

  const getReserveDatas = await api.multiCall({ abi: abis.Pool.getReserveData, calls: variablePools.map((variablePool, i) => ({ target: variablePool, params: underlyingBorrowTokens[i] })) })

  const aTokens = getReserveDatas.map(data => data.aTokenAddress)

  return api.sumTokens({
    owners: [...borrowATokens, ...markets],
    tokens: [...aTokens, ...underlyingCollateralTokens]
  })
}

async function borrowed(api, chain) {
  const markets = await api.call({ abi: abis.SizeFactory.getMarkets, target: SIZE_FACTORY[chain] })
  const datas = await api.multiCall({ abi: abis.Size.data, calls: markets })

  const debtTokens = datas.map(data => data.debtToken)

  const underlyingBorrowTokens = datas.map(data => data.underlyingBorrowToken)
  const totalDebts = await api.multiCall({ abi: 'erc20:totalSupply', calls: debtTokens });

  return api.add(underlyingBorrowTokens, totalDebts)
}

module.exports = {
  base: {
    tvl: (api) => tvl(api, 'base'),
    borrowed: (api) => borrowed(api, 'base')
  },
  ethereum: {
    tvl: (api) => tvl(api, 'ethereum'),
    borrowed: (api) => borrowed(api, 'ethereum')
  }
}