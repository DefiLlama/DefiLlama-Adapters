const {getChainTvl} = require('../helper/getUniSubgraphTvl');
const endpoint = 'https://api.thegraph.com/subgraphs/name/fuseio/fuseswap';

module.exports={
    tvl: getChainTvl({
        fuse: endpoint
    })('fuse')
}


