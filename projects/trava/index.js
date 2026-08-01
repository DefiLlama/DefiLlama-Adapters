const abi = {
  "getLendingPool": "function getLendingPool(uint256 providerId) view returns (address)",
  "getAddressesProviderFactory": "address:getAddressesProviderFactory",
  "getAllPools": "uint256[]:getAllPools",
  "getReservesList": "address[]:getReservesList",
  "getReserveData": "function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))",
}

const registry = {
  bsc: '0xD11fba861283174CBCb1FD0a475e420aa955bE61',
  fantom: '0xbb6d1ba6089309b09fb5e81ff37309c1a086b74a',
}

async function borrowed(api) {
  const factory = await api.call({ abi: abi.getAddressesProviderFactory, target: registry[api.chain] })
  const poolIds = await api.call({  abi: abi.getAllPools, target: factory})
  const pool = await api.call({ params: poolIds[0], abi: abi.getLendingPool, target: factory })
  const tTokens = (await api.call({ abi: abi.getReservesList, target: pool }))
  const reserveData = await api.multiCall({ abi: abi.getReserveData, calls: tTokens, target: pool })
  const vTokens = reserveData.map(i => i.variableDebtTokenAddress)
  const bals  = await api.multiCall({  abi: 'uint256:totalSupply', calls: vTokens})
  api.add(tTokens, bals)
}

async function tvl(api) {
  const factory = await api.call({ abi: abi.getAddressesProviderFactory, target: registry[api.chain] })
  const poolIds = await api.call({  abi: abi.getAllPools, target: factory})
  const pool = await api.call({ params: poolIds[0], abi: abi.getLendingPool, target: factory })
  const tTokens = (await api.call({ abi: abi.getReservesList, target: pool }))
  const reserveData = await api.multiCall({ abi: abi.getReserveData, calls: tTokens, target: pool })
  return api.sumTokens({
    tokensAndOwners2: [tTokens, reserveData.map(i => i.aTokenAddress)],
  })
}

module.exports = {
  methodology: 'Total supply in lending pools, not couting borrowed amount.',
  fantom: { tvl, borrowed },
  bsc: { tvl, borrowed },
}

module.exports.fantom.borrowed = () => ({}) // bad debt