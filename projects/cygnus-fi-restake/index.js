const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

// Cygnus is extending the restaking protocol to more chains.
// Bsquared is one of the first chains we are supporting.
const CYGNUS_RESTAKE_VAULT = {
    bsquared: '0x7551aEa51588AaCe99B89c3FaC3CFc4108DB8094'
}

module.exports = {
    methodology: "Calculates assets locked in cygnus restaking vault",
    bsquared: {
        tvl: sumTokensExport({ owner: CYGNUS_RESTAKE_VAULT.bsquared, tokens: [ADDRESSES.bsquared.UBTC] })
    }
}