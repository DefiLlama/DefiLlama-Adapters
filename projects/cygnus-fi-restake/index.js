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
        }
    }
}

const sumTvls = () => {
    const tvls = {}
    for (let chain in CYGNUS_POOL_CONFIG) {
        const chainPools = CYGNUS_POOL_CONFIG[chain];
        const tvl = {
            tvl: sumTokensExport({ owners: Object.values(chainPools).map(pool => pool.vault), tokens: Object.values(chainPools).map(pool => pool.depositToken) })
        }
        tvls[chain] = tvl;
    }
    return tvls;
}

module.exports = {
    methodology: "Calculates assets locked in cygnus restaking vault",
    ...sumTvls(),

}