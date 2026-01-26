const { sumTokensExport } = require('../helper/unwrapLPs')

// taken from https://gasp-stash-prod-dot-direct-pixel-353917.oa.r.appspot.com/affirmed-network/list
const config = {
  ethereum: '0x79d968d9017B96f202aD4673A2c1BBbdc905A4ca',
  arbitrum: '0x3aDdEb54ddd43Eb40235eC32DfA7928F28A44bb5',
  base: '0x308e483afDD225D6cb7bF4d44B8e4a03DFD9c0De',
}

Object.keys(config).forEach(chain => {
  const owner = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, fetchCoValentTokens: true })
  }
})