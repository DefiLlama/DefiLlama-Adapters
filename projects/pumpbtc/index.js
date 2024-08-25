const { nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'TVL for pumpBTC is calculated based on the total amount of pumpBTC.',
}
const config = {
  ethereum: { owners: [nullAddress], tokens: ['0xf469fbd2abcd6b9de8e169d128226c0fc90a012e'], },
  bsc: { owners: [nullAddress], tokens: ['0xf9C4FF105803A77eCB5DAE300871Ad76c2794fa4'], },
  mantle: { owners: [nullAddress], tokens: ['0xC75D7767F2EdFbc6a5b18Fc1fA5d51ffB57c2B37'], },
}

Object.keys(config).forEach(chain => {
  const { owners, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => api.sumTokens({ owners, tokens })
  }
})
