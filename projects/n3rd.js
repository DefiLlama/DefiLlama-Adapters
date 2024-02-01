const { masterChefExports, } = require("./helper/masterchef")
const { mergeExports, } = require("./helper/utils")
const { staking, } = require("./helper/staking")

const token = "0x32C868F6318D6334B2250F323D914Bc2239E4EeE";
const masterchef = "0x47cE2237d7235Ff865E1C74bF3C6d9AF88d1bbfF";

module.exports = mergeExports([
  masterChefExports(masterchef, "ethereum", token),
  {
    ethereum: {
      staking: staking('0x357ADa6E0da1BB40668BDDd3E3aF64F472Cbd9ff', token)
    }
  }
])
