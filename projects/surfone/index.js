const factoryContract = '0x5FeD7c030a1B3b40988984479Fdd666dE81038A3'
const positionContract = '0x1fa9702e774D31aB661D84f449b0Aa22c41D6827'
const merlinPoolContract = '0x69d2AbBCef322afcDAED52238f43882cEe3ACC08'
const merlinPositionContract = '0x7A3D0eBb547001E769F2A7AE3f0D7a9b3078F3C1'
const merlinConfigContract = '0xa3979d2A94F17196A9728A17765e5BD315CdacFb'
const ADDRESSES = require('../helper/coreAssets.json')

async function tvlBase(api) {
  const data = await api.call({ abi: abi.getAllPools, target: factoryContract })
  const ownerTokens = data.map(i => [[i.baseToken], i.pool])
  ownerTokens.push([[ADDRESSES.base.USDC, ADDRESSES.base.WETH], positionContract])
  return api.sumTokens({ ownerTokens, });
}

async function merlinTvl(api) {
  const tokens = await api.call({ abi: abi.getLiquidityTokens, target: merlinConfigContract })
  const lpTokens = tokens.map(i => i.indexToken)
  return api.sumTokens({owners:[merlinPoolContract,merlinPositionContract], tokens: lpTokens})
}

module.exports = {
  base: { tvl:tvlBase},
  merlin: {tvl:merlinTvl},
  methodology: "Count the total balance across all pools for all trading pairs.",
}

const abi = {
  "getAllPools": "function getAllPools() view returns (tuple(address baseToken, address spotToken, bytes32 spotTokenKey,string baseName,string spotName,uint24 feeP,address pool,uint256 index,uint8 groupIndex, uint256 chainId,bool reverse,uint256 flag)[])",
  "getLiquidityTokens": "function getLiquidityTokens() view returns (tuple(uint256 tokenIndex, string symbol, bytes32 spotTokenKey, address indexToken, uint8 indexTokenDecimals, address lpToken, address[] collateralToken, uint256 tokenWeight, uint256 maxGlobalShortSize, uint256 maxGlobalLongSize, uint256 maxDailyRemoveSize, uint256 minAddLiquiditySize)[])"
}
