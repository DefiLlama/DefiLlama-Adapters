const sdk = require('@defillama/sdk');
const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const chainTvl = getChainTvl({
    polis: 'https://graph.polis.tech/subgraphs/name/hadeswap/plutus/graphql',
}, "hadesSwapFactories")

module.exports = {
    misrepresentedTokens: true,
    polis: {
        tvl: chainTvl('polis')
    },
    tvl: sdk.util.sumChainTvls([chainTvl('polis')])
}