const { sumTokensExport } = require("../helper/unwrapLPs");

const tokensAndOwners = [
    ['0x79eB84B5E30Ef2481c8f00fD0Aa7aAd6Ac0AA54d', '0xE7aEC21BF6420FF483107adCB9360C4b31d69D78'], // autoDOLA in YieldStrategyDola
    ['0xa7569A44f348d3D70d8ad5889e50F78E33d80D35', '0x8b4A75290A1C4935eC1dfd990374AC4BD4D33952'], // autoUSDC in YieldStrategyUSDC
]

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the total amount of yield tokens held by the Phoenix Protocol's YieldStrategy contracts.",
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners }),
  },
};