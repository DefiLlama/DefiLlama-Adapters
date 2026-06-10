const { sumTokensExport } = require("../helper/unwrapLPs");

const tokensAndOwners = [
    ['0x79eB84B5E30Ef2481c8f00fD0Aa7aAd6Ac0AA54d', '0x90ce274b20A2aF4265152B369d09ce6E6Dc177F9'], // autoDOLA in YieldStrategyDola
    ['0xa7569A44f348d3D70d8ad5889e50F78E33d80D35', '0x90af002Ee537Ad5C2c9817Ebd4EF22B2e8952470'], // autoUSDC in YieldStrategyUSDC
    ['0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', '0xaC2e5936Eca286eC364d4D5Bcca33145fBe57f95'], // sUSDe in YieldStrategyUSDe
]

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the total amount of yield tokens held by the Phoenix Protocol's YieldStrategy contracts.",
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners }),
  },
};