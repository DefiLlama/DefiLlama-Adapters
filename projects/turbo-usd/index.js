const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "TVL is calculated from treasury reserves backing the Turbo USD stablecoin on BNB Smart Chain",
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x626503d7E46eDcb05f4B5787b53301121563E015"], // BSC Treasury
      tokens: [
        "0x55d398326f99059fF775485246999027B3197955", // USDT
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD  
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
      ],
    }),
  },
}
