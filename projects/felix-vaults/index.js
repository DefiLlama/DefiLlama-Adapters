const { getMorphoVaultTvl } = require("../helper/morpoho");

const hyperliquidConfig = {
  governor: "0x2157f54f7a745c772e686AA691Fa590B49171eC9",
}

module.exports = {
  doublecounted: true,
  hyperliquid: { tvl: getMorphoVaultTvl(hyperliquidConfig.governor, {
    vaults: [
      '0x835febf893c6dddee5cf762b0f8e31c5b06938ab', 
      '0xfc5126377f0efc0041c0969ef9ba903ce67d151e', 
      '0x9c59a9389d8f72de2cdaf1126f36ea4790e2275e', 
      '0x2900ABd73631b2f60747e687095537B673c06A76',
      '0x9896a8605763106e57A51aa0a97Fe8099E806bb3',
      '0x66c71204B70aE27BE6dC3eb41F9aF5868E68fDb6',
      '0x8A862fD6c12f9ad34C9c2ff45AB2b6712e8CEa27',
      '0x207ccaE51Ad2E1C240C4Ab4c94b670D438d2201C'
    ]
  }) },
}
