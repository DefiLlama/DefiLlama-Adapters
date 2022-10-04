const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address in Ethereum(0x03407772F5EBFB9B10Df007A2DD6FFf4EdE47B53) and in Curio(0xc36f5180b181f1b949e0ff4d65b258e0987f443f) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereum: {
    tvl: calculateUsdUniTvl(
      "0x03407772F5EBFB9B10Df007A2DD6FFf4EdE47B53",
      "ethereum",
      "0xf56b164efd3cfc02ba739b719b6526a6fa1ca32a",
      [
        "0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7", 
        "0x6b175474e89094c44da98b954eedeac495271d0f", 
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 
        "0xfdcdfa378818ac358739621ddfa8582e6ac1adcb",
        "0x46683747b55c4a0ff783b1a502ce682eb819eb75"
      ],
      "curio-governance"
    ),
  },
  curio: {
    tvl: calculateUsdUniTvl(
      "0xc36f5180b181f1b949e0ff4d65b258e0987f443f",
      "curio",
      "0x134EbAb7883dFa9D04d20674dd8A8A995fB40Ced",
      [
        "0x97F5E64c9e46d5F28AeD64C5B42cF8f7CCEEF317",
        "0x2BCEC1888D8c8d9B5955Bf9307a96BdC2122c849",
        "0xb5D8201e187Fd68aF4B54C7662124D93506dE505",
        "0x32ee5d263c76FE335feF85E4c6abE70E8d5CB097",
        "0x8648923e13a01f21852ce46017fe640858e0ad8c",
        "0xd2aaa00700000000000000000000000000000000",
        "0x300b4334cd9fbae70c4aef3abcad30fa31a1bb30"
      ],
      "curio-governance"
    ),
  },
};