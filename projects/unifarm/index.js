const sdk = require("@defillama/sdk");
const erc20Abi = require("./erc20.json");
const BigNumber = require("bignumber.js");
const fetch = require("cross-fetch");

const fetchPool = async (chainId, offset) => {
  return fetch("https://graph.unifarm.co/graphql", {
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
          offset: offset,
        },
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((e) => {
      // console.log(e)
    });
};

const fetchTotalCohorts = async (chainId) => {
  return fetch("https://graph.unifarm.co/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query Query($where: CohortGroupWhereClause!, $filter: Filter!) {
        allCohorts(where: $where, filter: $filter) {
          total_cohorts
        }
      }`,
      variables: {
        where: {
          chainId: chainId,
        },
        filter: {
          limit: 1,
        },
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((e) => {
      // console.log(e)
    });
};

const fetchPoolWithOffset = async (chainId) => {
  let cohorts = [];
  const Coh = await fetchTotalCohorts(chainId);
  const totalCohorts = Coh.data.allCohorts.total_cohorts;
  let counter = 0;
  while (totalCohorts > counter) {
    const poolData = await fetchPool(chainId, counter);
    poolData.data.allCohorts.cohorts.map((item) => {
      cohorts.push(item);
    });
    counter += poolData.data.allCohorts.cohorts.length;
  }

  return cohorts;
};

const _tvl = async (timestamp, ethBlock, chainBlocks, chain) => {
  const block = chainBlocks[chain];
  let pools = [];

  if (chain === "ethereum") {
    pools = await fetchPoolWithOffset(1);
  } else if (chain === "bsc") {
    pools = await fetchPoolWithOffset(56);
  } else {
    pools = await fetchPoolWithOffset(137);
  }

  let callsMapping = [];

  pools.map((data) => {
    data.tokens.map((token) => {
      callsMapping.push({
        target: data.cohortAddress,
        params: [token],
      });

      if (
        data.proxies[0] !== null &&
        data.proxies[0] !== "" &&
        data.proxies[0] !== undefined
      ) {
        callsMapping.push({
          target: data.proxies[0],
          params: [token],
        });
      }
    });
  });

  const multiCallResult = await sdk.api.abi.multiCall({
    abi: erc20Abi[0],
    calls: callsMapping,
    chain,
    block,
  });

  console.log(multiCallResult.output);
  return multiCallResult.output;
};

const ethereum = async (timestamp, ethBlock, chainBlocks) => {
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "ethereum");
  return balance;
};

const bsc = async (timestamp, ethBlock, chainBlocks) => {
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "bsc");
  return balance;
};

const polygon = async (timestamp, ethBlock, chainBlocks) => {
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "polygon");
  console.log(balance);
  return balance;
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
  tvl: sdk.util.sumChainTvls([ethereum, bsc, polygon]),
};
