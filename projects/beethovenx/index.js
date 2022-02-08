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


async function tvl() {
    const { data } = await request(
        graphUrl,
        graphQuery,
    );
    return toUSDTBalances(data.totalLiquidity)
}

module.exports = {
    fantom:{
        tvl,
    },
    tvl,
};
