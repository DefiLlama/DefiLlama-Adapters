const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const tokensAndOwners = [
  // Old - drained and migrated 2026-06-10 (kept for historical queries)
  ['0x79eB84B5E30Ef2481c8f00fD0Aa7aAd6Ac0AA54d', '0xE7aEC21BF6420FF483107adCB9360C4b31d69D78'], // autoDOLA in YieldStrategyDola
  ['0xa7569A44f348d3D70d8ad5889e50F78E33d80D35', '0x8b4A75290A1C4935eC1dfd990374AC4BD4D33952'], // autoUSDC in YieldStrategyUSDC
  [ADDRESSES.ethereum.sUSDe, '0xFc629bC5F6339F77635f4F656FBb114A31F7bCB3'], // sUSDe in YieldStrategyUSDe
  // New
  ['0x79eB84B5E30Ef2481c8f00fD0Aa7aAd6Ac0AA54d', '0x90ce274b20A2aF4265152B369d09ce6E6Dc177F9'], // autoDOLA in YieldStrategyDola
  ['0xa7569A44f348d3D70d8ad5889e50F78E33d80D35', '0x90af002Ee537Ad5C2c9817Ebd4EF22B2e8952470'], // autoUSDC in YieldStrategyUSDC
  [ADDRESSES.ethereum.sUSDe, '0xaC2e5936Eca286eC364d4D5Bcca33145fBe57f95'], // sUSDe in YieldStrategyUSDe
]

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the total amount of yield tokens held by the Phoenix Protocol's YieldStrategy contracts.",
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners }),
  },
};