const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

// Cygnus is extending the restaking protocol to more chains.
// Bsquared is one of the first chains we are supporting.

const CYGNUS_POOL_CONFIG = {
  bsquared: {
    UBTC: {
      depositToken: ADDRESSES.bsquared.UBTC,
      vault: '0x7551aEa51588AaCe99B89c3FaC3CFc4108DB8094'
    },
    STBTC: {
      depositToken: '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3',
      vault: '0x0Ce45dd53affbb011884EF1866E0738f58AB7969'
    },
    UNIBTC: {
      depositToken: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
      vault: '0xBc323bA4bbf2559417C3Ca47A75e2Ea341Cf8320'
    }
  }
}

module.exports = {
  methodology: "Calculates assets locked in cygnus restaking vault",
}

Object.keys(CYGNUS_POOL_CONFIG).forEach(chain => {
  const tokensAndOwners = Object.values(CYGNUS_POOL_CONFIG[chain]).map(i => [i.depositToken, i.vault])
  module.exports[chain] = { tvl: sumTokensExport({ tokensAndOwners }) }
})