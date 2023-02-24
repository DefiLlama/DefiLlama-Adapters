const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: {
    pools: [
      '0x4b7509ce029656341D0B59D387D9B5312E41615a',
      '0x34fa22892256216a659D4f635354250b4D771458',
    ]
  },
  moonbeam: {
    pools: [
      '0x3A82F4da24F93a32dc3C2A28cFA9D6E63EC28531',
      '0x3756465c5b1C1C4cEe473880c9726E20875284f1',
    ]
  }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { pools } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      const collaterals = await sdk.api2.abi.multiCall({
        abi: "address:collateral",
        calls: pools,
        chain, block,
      })
      return sumTokens2({ chain, block, tokensAndOwners: collaterals.map((i, idx) => ([i, pools[idx]]))})
    }
  }
})
