const { request, gql } = require("graphql-request");
var url = "https://thegraph.astroswap.app/subgraphs/name/astro";

async function fetch(timestamp) {
  var query = gql`
    query overviewCharts {
      pancakeDayDatas(
        first: 1000
        skip: 0
        where: { 
            date_gte: ${timestamp - 86400} 
            date_lt: ${timestamp}
        }
        orderBy: date
        orderDirection: asc
      ) {
        totalLiquidityUSD
      }
    }
  `;
  const response = await request(url, query);
  return response.pancakeDayDatas[0].totalLiquidityUSD;
}

module.exports = {
  timetravel: false,
  fetch,
};
