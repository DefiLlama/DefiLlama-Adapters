const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x0307cd3d7da98a29e6ed0d2137be386ec1e4bc9c) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereumclassic: {
    tvl: calculateUsdUniTvl(
      "0x0307cd3d7da98a29e6ed0d2137be386ec1e4bc9c",
      "ethereumclassic",
      "0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a",
      [
        "0x0dCb0CB0120d355CdE1ce56040be57Add0185BAa",
        "0xb12c13e66AdE1F72f71834f2FC5082Db8C091358",
        "0x2C78f1b70Ccf63CDEe49F9233e9fAa99D43AA07e",
        "0x218c3c3D49d0E7B37aff0D8bB079de36Ae61A4c0",
        "0x88d8C3Dc6B5324f34E8Cf229a93E197048671abD",
        "0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4",
        "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055",
        "0x332730a4F6E03D9C55829435f10360E13cfA41Ff"
      ],
      "ethereum-classic"
    ),
  },
}; // node test.js projects/etcswap/index.js