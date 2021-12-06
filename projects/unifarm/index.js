const sdk = require("@defillama/sdk");
const erc20Abi = require("./erc20.json");
const BigNumber = require("bignumber.js");
const fetch = require("cross-fetch");

const fetchPool = async (chainId) => {
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

const _tvl = async (timestamp, ethBlock, chainBlocks, chain) => {
  const block = chainBlocks[chain];
  let pools;

  try {
    if (chain === "ethereum") {
      const pool = await fetchPool(1);
      pools = pool.data.allCohorts.cohorts;
    } else if (chain === "bsc") {
      const pool = await fetchPool(56);
      pools = pool.data.allCohorts.cohorts;
    } else {
      const pool = await fetchPool(137);
      pools = pool.data.allCohorts.cohorts;
    }

    const multiCallResult = await sdk.api.abi.multiCall({
      calls: pools.map((data) => {
        return (
          data.tokens.map((token) => ({
            target: data.cohortAddress,
            params: token,
          })),
          data.tokens.map((token) => {
            if (!data.proxies) {
              return;
            }

            return {
              target: data.proxies[0],
              params: token,
            };
          })
        );
      }),
      block,
      abi: erc20Abi[5],
      chain,
    });
    return multiCallResult;
  } catch (e) {
    console.log(e);
  }
};

const ethereum = async (timestamp, ethBlock, chainBlocks) => {
  try {
    let balance = await _tvl(timestamp, ethBlock, chainBlocks, "ethereum");
    return balance;
  } catch (err) {
    console.log(err);
  }
};

const bsc = async (timestamp, ethBlock, chainBlocks) => {
  try {
    let balance = await _tvl(timestamp, ethBlock, chainBlocks, "bsc");
    return balance;
  } catch (err) {
    console.log(err);
  }
};

const polygon = async (timestamp, ethBlock, chainBlocks) => {
  try {
    let balance = await _tvl(timestamp, ethBlock, chainBlocks, "polygon");
    return balance;
  } catch (err) {
    console.log(err);
  }
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
