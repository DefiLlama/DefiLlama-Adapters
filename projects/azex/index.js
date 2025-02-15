const { sumTokensExport } = require("../helper/unwrapLPs")

const ADDRESSES = require("../helper/coreAssets.json")

const config = {
  berachain: {
    tokenConfig: {
      tokens: [
        ADDRESSES.berachain.WBERA,
        ADDRESSES.berachain.WBTC,
        ADDRESSES.berachain.USDe,
        ADDRESSES.berachain.rsETH,
        ADDRESSES.berachain.STONE,
        ADDRESSES.berachain.rswETH,
        ADDRESSES.berachain.sUSDe,
        ADDRESSES.berachain.USDC,
        ADDRESSES.berachain.HONEY,
        ADDRESSES.berachain.WETH,
      ],
      owners: [
        "0xaFE5B556743e33FE2A7F56054FecDa170602bEEA",
        "0x98a5Ca11A60E5ce035f4e5C63137065c4047599a",
        "0xDf85f9a327dD156eF2f1Bdd2EE81de008D62b753",
        "0x6A0ee26C9f2DB231a43A5551B37b7029bEBAc64a",
        "0x02e3d0F09E162470Af16E472119Ed4f2cC029E43",
        "0x2b50F56009572B22d7F44c7cEa16798635583088",
        "0x13C4913e507502eb0a01e597E0c963fFDbc86394",
        "0xCB03cbb019Df0bf0604b4D55682A22de27a15FaD"
      ],
    },
  },
}

Object.keys(config).forEach((chain) => {
  const { tokenConfig } = config[chain]

  module.exports[chain] = {
    tvl: sumTokensExport(tokenConfig)
  }
})
