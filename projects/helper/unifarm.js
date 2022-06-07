const axios = require("axios");

const ETH_CHAIN = "ethereum";
const BSC_CHAIN = "bsc";
const POLYGON_CHAIN = "polygon";

const ETH_TOKENLIST =
  "https://raw.githubusercontent.com/InfernalHeir/tokenlist/mainnet-01/unifarm-tokenlist.json";
const BSC_TOKENLIST =
  "https://raw.githubusercontent.com/InfernalHeir/tokenlist/mainnet-01/unifarm.tokenlist.56.json";
const POLYGON_TOKENLIST =
  "https://raw.githubusercontent.com/InfernalHeir/tokenlist/mainnet-01/unifarm.tokenlist.137.json";

const GRAPH_ENDPOINT = "https://graph.unifarm.co/graphql";

const QUERY = `
query GetCohort($where: CohortGroupWhereClause!) {
  allCohortsAndProxies(where: $where) {
    cohortAddress
    proxies
  }
}
`;

const getCohortTokens = async (url) => {
  const results = await axios.get(url);
  return results.data.tokenlist;
};

const getCohortTokensByChainName = async (chain) => {
  switch (chain) {
    case ETH_CHAIN:
      return await getCohortTokens(ETH_TOKENLIST);
    case BSC_CHAIN:
      return await getCohortTokens(BSC_TOKENLIST);
    case POLYGON_CHAIN:
      return await getCohortTokens(POLYGON_TOKENLIST);
    default:
      break;
  }
};

const getCohortAndProxies = async (chainId) => {
  try {
    const results = await axios.post(
      GRAPH_ENDPOINT,
      JSON.stringify({
        query: QUERY,
        variables: {
          where: {
            chainId,
          },
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return results.data.data.allCohortsAndProxies;
  } catch (err) {
    console.log(err.message);
  }
};

const getCohortsAndProxiesByChain = async (chain) => {
  switch (chain) {
    case ETH_CHAIN:
      return getCohortAndProxies(1);
    case BSC_CHAIN:
      return getCohortAndProxies(56);
    case POLYGON_CHAIN:
      return getCohortAndProxies(137);
    default:
      return null;
  }
};

const createCalls = (tokens, cohortId) => {
  return tokens.map((items) => {
    return {
      target: items.address,
      params: [cohortId],
    };
  });
};

const createMulticalls = (cohortAndProxies, tokens) => {
  let calls = [];
  for (var u = 0; u < cohortAndProxies.length; u++) {
    const items = cohortAndProxies[u];
    const cohortId = items.cohortAddress;
    const proxies = items.proxies;
    calls.push(...createCalls(tokens, cohortId));
    if (proxies && proxies[0] !== undefined) {
      for (var k = 0; k < proxies.length; k++) {
        calls.push(...createCalls(tokens, proxies[k]));
      }
    }
  }
  return calls;
};

module.exports = {
  createMulticalls,
  getCohortTokensByChainName,
  getCohortsAndProxiesByChain,
};
