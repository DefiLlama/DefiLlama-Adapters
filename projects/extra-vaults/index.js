const { getMorphoVaultTvl } = require("../helper/morpoho")

const config = {
  base: {
    governor: "0x8b621804a7637b781e2BbD58e256a591F2dF7d51",
    morphoVaults: ['0x5A32099837D89E3a794a44fb131CBbAD41f87a8C', '0x23479229e52Ab6aaD312D0B03DF9F33B46753B5e']
  }
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: getMorphoVaultTvl(config[chain].governor, { vaults: config[chain].morphoVaults })
  }
});