const {getBalancerSubgraphTvl} = require('../helper/balancer')

module.exports={
    fantom:{
        tvl: getBalancerSubgraphTvl('https://graph.beethovenx.io/subgraphs/name/beethovenx', 'fantom')
    }
}