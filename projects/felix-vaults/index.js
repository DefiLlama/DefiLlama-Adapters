const { getMorphoVaultTvl } = require("../helper/morpoho");

const hyperliquidConfig = {
  governor: "0x2157f54f7a745c772e686AA691Fa590B49171eC9",
}

module.exports = {
  doublecounted: true,
  hyperliquid: { tvl: getMorphoVaultTvl(hyperliquidConfig.governor, {
    vaults: ['0x835febf893c6dddee5cf762b0f8e31c5b06938ab', '0xfc5126377f0efc0041c0969ef9ba903ce67d151e']
  }) },
}
