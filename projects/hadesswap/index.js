const sdk = require('@defillama/sdk');
const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const chainTvl = getChainTvl({
    polis: 'https://graph.polis.tech/subgraphs/name/hadeswap/exchange',
}, "factories", "liquidityUSD")

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    polis: {
        tvl: chainTvl('polis')
    },
}
