const { request, gql } = require('graphql-request');
const { toUSDTBalances } = require('./helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza';
const graphQuery = gql`
   query get_tvl($timestamp: Int) {
      hourlies(first: 1, orderBy: date, orderDirection: desc, where:{date_lte: $timestamp}) {
			totalValueLockedUSD
		}
   }
`;

async function tvl(timestamp, block) {
   const { hourlies } = await request(graphUrl, graphQuery, {
      timestamp,
   });
   const usdTvl = Number(hourlies[0].totalValueLockedUSD);

   return toUSDTBalances(usdTvl);
}

module.exports = {
   ethereum: {
      tvl,
   },
   tvl,
};
