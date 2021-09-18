const utils = require("../helper/utils");
const retry = require("../helper/retry");
const { GraphQLClient, gql } = require("graphql-request");

const gqls = {
  eth: new GraphQLClient("https://analytics-eth.cyclone.xyz/query"),
  bsc: new GraphQLClient("https://analytics-bsc.cyclone.xyz/query"),
  iotex: new GraphQLClient("https://analytics-iotex.cyclone.xyz/query"),
  polygon: new GraphQLClient("https://analytics-polygon.cyclone.xyz/query"),
};

function fetchChain(chain) {
  return async () => {
    const graphQLClient = gqls[chain];
    const query = gql`
      {
        total {
          lpLocked
          pool
        }
      }
    `;
    const result = await retry(
      async (fail) => await graphQLClient.request(query)
    );
    const { lpLocked, pool } = result.total;
    return Number(lpLocked) + Number(pool);
  };
}

async function fetch() {
  const result = await utils.fetchURL("https://cyclone.xyz/api/tvl");

  return result.data.tvl;
}

module.exports = {
  iotex: {
    fetch: fetchChain("iotex"),
  },
  eth: {
    fetch: fetchChain("eth"),
  },
  bsc: {
    fetch: fetchChain("bsc"),
  },
  polygon: {
    fetch: fetchChain("polygon"),
  },
  fetch,
};
