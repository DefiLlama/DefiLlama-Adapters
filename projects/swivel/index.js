const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unknownTokens");

module.exports = {
  hallmarks: [
    ['2023-03-13', 'Euler was hacked'],
  ],
  deadFrom: '2023-03-13',
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x3b983B701406010866bD68331aAed374fb9f50C9", // Swivel v1
        "0x093e4d20d9b2c3c8f68e8a20262d8fb8ebce08fa", // Swivel v2
        "0x373a06bD3067f8DA90239a47f316F09312b7800F" // Swivel v3
      ],
      tokens: [
        "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDC,
        "0x39AA39c021dfbaE8faC545936693aC917d5E7563", // cUSDC,
        // "0xEb91861f8A4e1C12333F42DCE8fB0Ecdc28dA716", // eUSDC
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.WSTETH,
        "0x5E8422345238F34275888049021821E8E08CAa1f", // frxETH
        ADDRESSES.ethereum.sfrxETH
      ]
    })
  }
};
