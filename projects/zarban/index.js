const abi = {
  "getReservesList": "address[]:getReservesList",
  "getReserveData": "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address zTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))",
  "list": "function list() view returns (bytes32[])",
  "join": "function join(bytes32 ilk) view returns (address)",
  "gem": "address:gem",
  "debt": "uint256:debt"
}

//constant addresses
const lendingPoolAddress = "0xC62545B7f466317b014773D1C605cA0D0931B0Fd";
const ilkRegistryAddress = "0x821282748eb5b63155df21c62d6a6699ffcb01cf";
const zar = "0xd946188a614a0d9d0685a60f541bba1e8cc421ae";

async function getLmMarkets(api) {
  const tokens = await api.call({  abi: abi.getReservesList, target: lendingPoolAddress})
  const markets = await api.multiCall({  abi: abi.getReserveData, calls: tokens, target: lendingPoolAddress, })
  return [tokens, markets]
}

async function getScsMarkets(api) {

  const ilks = await api.call({ target: ilkRegistryAddress, abi: abi.list, })
  const gemJoins = await api.multiCall({  abi: abi.join, calls: ilks, target: ilkRegistryAddress, })
  const gems = await api.multiCall({  abi: abi.gem, calls: gemJoins,  })

  return api.sumTokens({ tokensAndOwners2: [gems, gemJoins] })
}


async function tvl(api) {
  await getScsMarkets(api)
  const [lmTokens, lmMarkets] = await getLmMarkets(api)

  await api.sumTokens({ tokensAndOwners2: [lmTokens, lmMarkets.map(i => i.zTokenAddress)] })
  api.removeTokenBalance(zar)
}

async function borrowed(api) {

  const [tokens, markets] = await getLmMarkets(api)
  const stableDebtTokens = markets.map(i => i.stableDebtTokenAddress)
  const variableDebtTokens = markets.map(i => i.variableDebtTokenAddress)
  const stableSupply = await api.multiCall({  abi: 'uint256:totalSupply', calls: stableDebtTokens })
  const variableSupply = await api.multiCall({  abi: 'uint256:totalSupply', calls: variableDebtTokens })
  api.add(tokens, stableSupply)
  api.add(tokens, variableSupply)
}

module.exports = {
  arbitrum: { tvl, borrowed, }
}