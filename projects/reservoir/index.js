const { request, gql } = require('graphql-request');

const GRAPHQL_URL = 'https://data.staging.arkiver.net/robolabs/reservoir-mainnet-v2/graphql';

const graphQuery = gql`
query GetStats {
    PairSnapshots {
        reserve0
        reserve1
        managed0
        managed1
        pair {
            token0
            token1
            token0Decimals
            token1Decimals
        }
    }
}
`;

async function tvl(_, _1, _2, { api }) {
  const { PairSnapshots } = await request(GRAPHQL_URL, graphQuery);

  const tokenBalanceMapping = {}

  for (const snapshot of PairSnapshots) {
    if (!tokenBalanceMapping[snapshot.pair.token0]) tokenBalanceMapping[snapshot.pair.token0] = 0n;
    if (!tokenBalanceMapping[snapshot.pair.token1]) tokenBalanceMapping[snapshot.pair.token1] = 0n;

    // we need to exclude the assets managed by AAVE from the tvl
    // as this is the rule of defillama
    tokenBalanceMapping[snapshot.pair.token0] += BigInt(Math.trunc((snapshot.reserve0 - snapshot.managed0) * 10 ** snapshot.pair.token0Decimals));
    tokenBalanceMapping[snapshot.pair.token1] += BigInt(Math.trunc((snapshot.reserve1 - snapshot.managed1) * 10 ** snapshot.pair.token1Decimals));
  }

  api.addTokens(Object.keys(tokenBalanceMapping), Object.values(tokenBalanceMapping).map(val => val.toString()));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Returns the current balances in the LP. Excludes tokens managed by the asset manager as they are in another protocol',
  avax: {
    tvl
   },
};
