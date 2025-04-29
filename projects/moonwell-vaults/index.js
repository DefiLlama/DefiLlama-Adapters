const { getMorphoVaultTvl } = require("../helper/morpoho");

const baseConfig = {
  governor: "0x8b621804a7637b781e2BbD58e256a591F2dF7d51",
}

const optimismConfig = {
  governor: "0x17C9ba3fDa7EC71CcfD75f978Ef31E21927aFF3d",
}

module.exports = {
  doublecounted: true,
  base: { tvl: getMorphoVaultTvl(baseConfig.governor) },
  optimism: { tvl: getMorphoVaultTvl(optimismConfig.governor) },
}
