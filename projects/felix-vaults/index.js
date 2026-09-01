const { getMorphoVaultTvl } = require("../helper/morpoho");

const hyperliquidConfig = {
  governor: "0x4A827418D632C415E19825fd011283A4ba020B3A",
}

module.exports = {
  doublecounted: true,
  hyperliquid: {
    tvl: getMorphoVaultTvl(hyperliquidConfig.governor)
  },
}
