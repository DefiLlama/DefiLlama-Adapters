const { graphQuery } = require("../helper/http");

const ENVIO_GRAPHQL_URL = "https://kby-hasura.up.railway.app/v1/graphql";

const query = `
  query {
    UniswapDayData(
      where: { chainId: { _eq: 4326 } }
      order_by: { date: desc }
      limit: 1
    ) {
      tvlUSD
    }
  }
`;

async function tvl() {
  const data = await graphQuery(ENVIO_GRAPHQL_URL, query);
  const tvlUSD = data?.UniswapDayData?.[0]?.tvlUSD || 0;
  return { tether: parseFloat(tvlUSD) };
}

module.exports = {
  megaeth: { tvl },
};
