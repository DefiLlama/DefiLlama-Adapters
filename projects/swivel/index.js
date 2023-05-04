const { sumTokensExport } = require("../helper/unknownTokens");

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-03-13') / 1e3), 'Euler was hacked'],
  ],
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x3b983B701406010866bD68331aAed374fb9f50C9", // Swivel v1
        "0x093e4d20d9b2c3c8f68e8a20262d8fb8ebce08fa", // Swivel v2
        "0x373a06bD3067f8DA90239a47f316F09312b7800F" // Swivel v3
      ],
      tokens: [
        "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
        "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x39AA39c021dfbaE8faC545936693aC917d5E7563", // cUSDC,
        // "0xEb91861f8A4e1C12333F42DCE8fB0Ecdc28dA716", // eUSDC
        "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // Lido stETH
        "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // Lido wstETH
        "0x5E8422345238F34275888049021821E8E08CAa1f", // frxETH
        "0xac3E018457B222d93114458476f3E3416Abbe38F" // sfrxETH
      ]
    })
  }
};
