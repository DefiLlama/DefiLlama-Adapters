const { call } = require("@defillama/sdk/build/abi");
const axios = require("axios");
const BigNumber = require("bignumber.js");

const ETH_CHAIN = "ethereum";
const BSC_CHAIN = "bsc";
const POLYGON_CHAIN = "polygon";

const liquidityContract = {
  ethereum: "0xD13dF6B426358C2471bC6dea75167c3c106Ef881",
  bsc: "0x7423Af05D11e7363cF5Ea5Ef2eA55c7E7AEA3f7a",
  polygon: "0x62CEfDaDd37C8169034b2efD4401bc770B7B92D3",
};

const UFARM = {
  ethereum: "0x40986a85b4cfcdb054a6cbfb1210194fee51af88", //Ufarm ethereum
  bsc: "0x0a356f512f6fce740111ee04ab1699017a908680", // ufarm BSC
  polygon: "0xa7305ae84519ff8be02484cda45834c4e7d13dd6", //ufarm Polygon
  avax: "0xd60effed653f3f1b69047f2d2dc4e808a548767b", // ufarm avax
};

const ORO = {
  ethereum: "0xc3eb2622190c57429aac3901808994443b64b466", // ethereum
  bsc: "0x9f998d62B81AF019E3346AF141f90ccCD679825E", //BSC
};

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

const v2Query = `
query MyQuery {
  cohorts {
    cohortVersion
    numberOfFarms,
    id,
    tokens {
      decimals
      farmToken
      fid
    }
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

const getV2GraphEndPoint = (chain) => {
  switch (chain) {
    case ETH_CHAIN:
      return "https://api.thegraph.com/subgraphs/name/themohitmadan/unifarm-eth";
    case BSC_CHAIN:
      return "https://api.thegraph.com/subgraphs/name/themohitmadan/unifarm-bsc";
    case POLYGON_CHAIN:
      return "https://api.thegraph.com/subgraphs/name/themohitmadan/unifarm-polygon";
    default:
      break;
  }
};

const getV2Cohorts = async (chain) => {
  const V2_GRAPH_ENDPOINT = getV2GraphEndPoint(chain);
  try {
    const results = await axios.post(
      V2_GRAPH_ENDPOINT,
      JSON.stringify({
        query: v2Query,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return results.data.data.cohorts;
  } catch (err) {
    console.log(err.message);
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

const createV2Calls = (tokens, cohortId) => {
  return tokens.map((items) => {
    return {
      target: items.farmToken,
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

const createMulticallForV2 = (cohorts) => {
  let calls = [];
  for (let i = 0; i < cohorts.length; i++) {
    calls.push(...createV2Calls(cohorts[i].tokens, cohorts[i].id));
  }

  return calls;
};

const createCallForSetu = (chain) => {
  let calls = [];
  calls.push({
    target: UFARM[chain],
    params: liquidityContract[chain],
  });

  if (chain === "ethereum" || chain === "bsc") {
    calls.push({
      target: ORO[chain],
      params: liquidityContract[chain],
    });
  }
  return calls;
};

const getFormattedBalance = (input, decimals) => {
  return new BigNumber(input).dividedBy(new BigNumber(10 ** Number(decimals)));
};

const getBigNumberBalance = (input, decimals) => {
  return new BigNumber(input)
    .multipliedBy(new BigNumber(10).pow(decimals))
    .toFixed(0);
};

// const fetchBridge = async () => {
//   const results = await axios.get("https://api.setu.unifarm.co/api/tokens");
//   return results.data;
// };

module.exports = {
  createMulticalls,
  getCohortTokensByChainName,
  getCohortsAndProxiesByChain,
  getV2Cohorts,
  createMulticallForV2,
  createCallForSetu,
  getFormattedBalance,
  getBigNumberBalance,
};
