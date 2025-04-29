const { nullAddress } = require("../helper/tokenMapping")

const config = {
  berachain: {
    OrderBook: "0x98a5Ca11A60E5ce035f4e5C63137065c4047599a",
    AssetManager: "0xaFE5B556743e33FE2A7F56054FecDa170602bEEA",
    Reader: "0x90461F7C369Ec87db724d3f1B090170a7bE0D61a",
    Staker: "0xCB03cbb019Df0bf0604b4D55682A22de27a15FaD",
    StakingToken: "0x9B3B073E41f460c37641712D2aEEA656ea71865D",
  },

  unichain: {
    OrderBook: "0xF20fe1bd8B626A9B42478f25F93640438Bc14602",
    AssetManager: "0xD85f4D18FCaFc86Bca4f98F3287930CA5a513ba9",
    Reader: "0xaCEf1CEF3E4Af80Ddc5273723777A5c50B1306E1",
    Staker: "0x56F8619AD96DE71D668391865Fb3bF74e1670DFb",
    StakingToken: "0x5ba5Ba5327D148e2b4F398276224afc9235F3102",
  },
}

const abi = {
  "getAssets": "function getAssets() view returns ((address asset, string name, string symbol, uint8 decimals, uint256 balance, uint256 alpId, (bool asStableCoin, uint256 borrowingInterval, uint256 borrowingRateFactor, uint256 minBorrowingUsdPool, uint256 minOrderAmount, uint256 minPositionAmount, bool onlyFastPriceFeed, bytes32 pythPriceId, uint256 spreadBps, uint256 tradeMiningRate) config)[])",
}

Object.keys(config).forEach(chain => {
  const { AssetManager, Reader, OrderBook } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const assets = await api.call({ abi: abi.getAssets, target: Reader })
      const tokens = assets.map(asset => asset.asset === '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF' ? nullAddress : asset.asset)
      return api.sumTokens({ owners: [AssetManager, OrderBook,], tokens })
    }
  }
})
