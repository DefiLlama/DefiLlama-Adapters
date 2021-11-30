const sdk = require("@defillama/sdk");
const erc20Abi = require("./erc20.json");
const BigNumber = require("bignumber.js");
const fetch = require("cross-fetch");

const fetchPool = (chainId) => {
  let pool;
  fetch("https://graph.unifarm.co/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query Query($where: CohortGroupWhereClause!, $filter: Filter!) {
        allCohorts(where: $where, filter: $filter) {
          cohorts {
            tokens
            proxies
            cohortAddress
          }
        }
      }`,
      variables: {
        where: {
          chainId: chainId,
        },
        filter: {
          limit: 100,
        },
      },
    }),
  }).then((res) => {
    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    pool = res.data.allCohorts.cohorts;
  });
  return pool;
};

const _tvl = async (timestamp, ethBlock, chainBlocks, chain) => {
  const block = chainBlocks[chain];
  let pools;

  if (chain === "ethereum") {
    pools = await fetchPool(1);
  } else if (chain === "bsc") {
    pools = await fetchPool(56);
  } else {
    pools = await fetchPool(137);
  }

  console.log(pools);

  const multiCallResult = await sdk.api.abi.multiCall({
    calls: pools.map(
      (data) => (
        {
          target: data.cohortAddress,
          params: data.tokens,
        },
        {
          target: data.proxies[0],
          params: data.tokens,
        }
      )
    ),
    block,
    abi: erc20Abi[5],
    chain,
  });

  return multiCallResult;
};

const ethereum = async (timestamp, ethBlock, chainBlocks) => {
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "ethereum");
  return arrayToObject(balance, "ethereum");
};

const bsc = async (timestamp, ethBlock, chainBlocks) => {
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "bsc");
  return arrayToObject(balance, "bsc");
};

const polygon = async (timestamp, ethBlock, chainBlocks) => {
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "polygon");
  return arrayToObject(balance, "polygon");
};

module.exports = {
  ethereum: {
    tvl: ethereum,
  },
  bsc: {
    tvl: bsc,
  },
  polygon: {
    tvl: polygon,
  },
};
