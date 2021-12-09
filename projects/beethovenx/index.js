const {getBalancerSubgraphTvl} = require('../helper/balancer')

module.exports={
    fantom:{
        tvl: getBalancerSubgraphTvl('https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx-v4', 'fantom')
    }
}