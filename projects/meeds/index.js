const { staking } = require("../helper/staking");

module.exports = {
  methodology: "Xmeeds and TokenFactory contracts are used for calculating staking/farm volume",
  ethereum: {
    tvl: () => ({}),
    staking: staking(["0x44D6d6aB50401Dd846336e9C706A492f06E1Bcd4", "0x1B37D04759aD542640Cc44Ff849a373040386050",], '0x8503a7b00B4b52692cC6c14e5b96F142E30547b7')
  },
}