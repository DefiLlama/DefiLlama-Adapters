const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

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

async function tvl(timestamp, block) {
    const { indexPools } = await request(
        graphUrl,
        graphQuery,
        {
            block,
        }
    );
    const usdTvl = indexPools.reduce((total, p) => total + Number(p.totalValueLockedUSD), 0)

    return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
    name: 'Indexed',
    token: 'NDX',
    category: 'Indexes',
    eth: tvl,
    start: 0, // WRONG!
    tvl
}