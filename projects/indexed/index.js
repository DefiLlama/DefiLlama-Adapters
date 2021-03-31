const { request, gql } = require("graphql-request");

const graphUrl = 'https://api.thegraph.com/subgraphs/name/indexed-finance/indexed'
const graphQuery = gql`
query get_indexes($block: Int) {
  indexPools(
    block: { number: $block }
  ) {
    name
    totalValueLockedUSD
  }
}
`;
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'

async function tvl(timestamp, block) {
    const { indexPools } = await request(
        graphUrl,
        graphQuery,
        {
            block,
        }
    );
    const usdTvl = indexPools.reduce((total, p) => total + Number(p.totalValueLockedUSD), 0)

    return {
        [usdtAddress]: (usdTvl*1e6).toFixed(0)
    }
}

module.exports = {
    name: 'Indexed',
    token: 'NDX',
    category: 'Indexes',
    eth: tvl,
    start: 0, // WRONG!
    tvl
}