const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');
const endpoint = 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange';

module.exports = {
    tvl: getUniTVL({
        factory: '0x1998E4b0F1F922367d8Ec20600ea2b86df55f34E',
        chain: 'fuse',
        useDefaultCoreAssets: true,
    })
}


