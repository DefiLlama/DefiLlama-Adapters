const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require("../helper/balances");

const graphUrl =
    'https://backend.beets-ftm-node.com/graphql';

const graphQuery = gql`
    query get_tvl {
            data: beetsGetProtocolData {
                totalLiquidity
            }
    }
`;

async function tvl(timestamp, ...params) {
    if(Math.abs(timestamp - Date.now()/1000) < 3600/2){
        const { data } = await request(
            graphUrl,
            graphQuery,
        );
        return toUSDTBalances(data.totalLiquidity)
    }
    return getBalancerSubgraphTvl('https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx', 'fantom')(timestamp, ...params)
}

const {getBalancerSubgraphTvl} = require('../helper/balancer')

module.exports = {
    fantom:{
        tvl,
    },
};
