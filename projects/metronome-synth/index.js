const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x3691ef68ba22a854c36bc92f6b5f30473ef5fb0a',
      tokens: [
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xd1C117319B3595fbc39b471AB1fd485629eb05F2",
        "0x853d955aCEf822Db058eb8505911ED77F175b99e",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        "0xa8b607Aa09B6A2E306F93e74c282Fb13f6A80452",
        "0xc14900dFB1Aa54e7674e1eCf9ce02b3b35157ba5",
        "0xac3E018457B222d93114458476f3E3416Abbe38F",
        "0x4Dbe3f01aBe271D3E65432c74851625a8c30Aa7B",
        "0x691Af94cC63B99bd36173eD6Fb1eF5508b2774ec"
      ]
    }),
  }
  optimism: {
    tvl: sumTokensExport({
      owner: '0x4C6bF87b7fc1C8Db85877151C6edE38Ed27c34f6',
      tokens: [
        "0x4200000000000000000000000000000000000042",
        "0x4200000000000000000000000000000000000006",
        "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
        "0x293aaC1fef48b2ebf95d0CB3a31A7B219e8Ece9E",
        "0x4E71790712424f246358D08A4De6C9896482dE64",
        "0x25Ee6eA9353E0ffa3155655F3dF9140684671f36",
        "0x564baA321227abf6B2E88a38557b6517077aAD32"

      ]
    }),
  },
}
