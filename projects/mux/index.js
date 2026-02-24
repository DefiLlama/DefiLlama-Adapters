const abi = {
    "getChainStorage": "function getChainStorage() returns (tuple(tuple(uint32 shortFundingBaseRate8H, uint32 shortFundingLimitRate8H, uint32 fundingInterval, uint32 liquidityBaseFeeRate, uint32 liquidityDynamicFeeRate, uint96 mlpPriceLowerBound, uint96 mlpPriceUpperBound, uint32 lastFundingTime, uint32 sequence, uint32 strictStableDeviation) pool, tuple(bytes32 symbol, address tokenAddress, address muxTokenAddress, uint8 id, uint8 decimals, uint56 flags, uint32 initialMarginRate, uint32 maintenanceMarginRate, uint32 positionFeeRate, uint32 liquidationFeeRate, uint32 minProfitRate, uint32 minProfitTime, uint96 maxLongPositionSize, uint96 maxShortPositionSize, uint32 spotWeight, uint32 longFundingBaseRate8H, uint32 longFundingLimitRate8H, uint8 referenceOracleType, address referenceOracle, uint32 referenceDeviation, uint32 halfSpread, uint128 longCumulativeFundingRate, uint128 shortCumulativeFunding, uint96 spotLiquidity, uint96 credit, uint96 totalLongPosition, uint96 totalShortPosition, uint96 averageLongPrice, uint96 averageShortPrice, uint128 collectedFee, uint256 deduct)[] assets, tuple(uint8 dexId, uint8 dexType, uint8[] assetIds, uint32[] assetWeightInDEX, uint256[] totalSpotInDEX, uint32 dexWeight, uint256 dexLPBalance, uint256[] liquidityBalance)[] dexes, uint32 liquidityLockPeriod, uint32 marketOrderTimeout, uint32 maxLimitOrderTimeout, uint256 lpDeduct, uint256 stableDeduct, bool isPositionOrderPaused, bool isLiquidityOrderPaused) chain)",
    "pool": "address:pool"
  };
const mux3CoreAbi = {
    "listCollateralPool": "function listCollateralPool() returns (address[] pools)",
    "listCollateralTokens": "function listCollateralTokens() returns (address[] tokens)"
  };
const { sumTokens2 } = require('../helper/unwrapLPs')

const readerContract = {
  arbitrum: '0x437CEa956B415e97517020490205c07f4a845168',
  bsc: '0x2981Bb8F9c7f7C5b9d8CA5e41C0D9cBbd89C7489',
  avax: '0xB33e3dDcE77b7679fA92AF77863Ae439C44c8519',
  fantom: '0xfb0DCDC30BF892Ec981255e7133AEcb8ea642b76',
  optimism: '0x572E9467b2585c3Ab6D9CbEEED9619Fd168254D5',
}

const mux3CoreAddress = '0x85c8F4a67F4f9AD7b38e875c8FeDE7F4c878bFAc'

async function getMux3Tvl(api) {
  // get all mux3 collateral pools
  const pools = await api.call({
    target: mux3CoreAddress,
    abi: mux3CoreAbi.listCollateralPool,
  })

  // get all supported collateral tokens
  const collateralTokens = await api.call({
    target: mux3CoreAddress,
    abi: mux3CoreAbi.listCollateralTokens,
  })

  // get balances of all collateral tokens in all collateral pools
  return sumTokens2({ api, tokens: collateralTokens, owners: pools, })
}

async function tvl(api) {
  const storage = await api.call({ target: readerContract[api.chain], abi: abi.getChainStorage, })
  const pool = await api.call({ target: readerContract[api.chain], abi: abi.pool, })

  const assets = storage[1]
  const dexs = storage[2]
  await sumTokens2({ api, tokens: assets.map(i => i.tokenAddress), owner: pool, })


  dexs.forEach(dex => {
    dex.liquidityBalance.forEach((balance, index) => {
      const assetId = dex.assetIds[index]
      const token = assets.find(t => assetId === t.id)
      api.add(token.tokenAddress, balance)
    })
  })

  // get mux3 tvl, only for arbitrum
  if (api.chain === 'arbitrum')
    await getMux3Tvl(api)
}

Object.keys(readerContract).forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})