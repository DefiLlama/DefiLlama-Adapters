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
        "0xac3E018457B222d93114458476f3E3416Abbe38F"
      ]
    }),
  },
}
