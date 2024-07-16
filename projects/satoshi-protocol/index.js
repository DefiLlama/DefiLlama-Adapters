const { sumTokens2 } = require("../helper/unwrapLPs")

function createExports(troveList) {
  return {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:collateralToken', calls: troveList })
      return sumTokens2({ api, tokensAndOwners2: [tokens, troveList] })
    },
  }
}

module.exports = {
  bevm: createExports([
    '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA', // BEVM WBTC Collateral
    '0xa794a7Fd668FE378E095849caafA8C8dC7E84780', // BEVM wstBTC Collateral
  ]),
  btr: createExports([
    '0xf1A7b474440702BC32F622291B3A01B80247835E', // BITLAYER WBTC Collateral
    '0xe9897fe6C8bf96D5ef8B0ECC7cBfEdef9818232c', // BITLAYER stBTC Collateral
  ]),  
}
