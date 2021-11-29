const sdk = require("@defillama/sdk");
const erc20Abi = require("./erc20.json");
const BigNumber = require("bignumber.js");
const fetch = require("cross-fetch");

const fetchPool = (chainId) => {
  fetch("https://graph.unifarm.co/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
                query AllPools($where: PoolsGroupWhereClause!) {
                    allPools(where: $where) {
                    pools {
                        cohort {
                        cohortAddress
                        tokens
                        }
                    }
                    }
                }
                `,
      variables: {
        where: {
          chainId: chainId,
        },
      },
    }),
  }).then((res) => {
    return res.json();
  });
};

const _tvl = async (timestamp, ethBlock, chainBlocks, chain) => {
  const block = chainBlocks[chain];
  var tokens = [];
  let pools;

  if (chain === "ethereum") {
    tokens = ethereumToken;
    pools = fetchPool(1);
  } else if (chain === "bsc") {
    tokens = bscToken;
    pools = fetchPool(56);
  } else {
    tokens = polygonToken;
    pools = fetchPool(137);
  }

  const multiCallResult = await sdk.api.abi.multiCall({
    calls: pools.data.allpools.pools.map((data) => ({
      target: data.cohotAddress,
      params: data.tokens,
    })),
    block,
    abi: erc20Abi[5],
    chain,
  });

  return multiCallResult;
};

const ethereum = async (timestamp, ethBlock, chainBlocks) => {
  let balance = [];
  await Promise(_tvl(timestamp, ethBlock, chainBlocks, "ethereum")).then(
    (values) => {
      balance = values;
    }
  );
  return arrayToObject(balance, "ethereum");
};

const bsc = async (timestamp, ethBlock, chainBlocks) => {
  let balance = [];
  await Promise(_tvl(timestamp, ethBlock, chainBlocks, "bsc")).then(
    (values) => {
      balance = values;
    }
  );
  return arrayToObject(balance, "bsc");
};

const polygon = async (timestamp, ethBlock, chainBlocks) => {
  let balance = [];
  await Promise(_tvl(timestamp, ethBlock, chainBlocks, "polygon")).then(
    (values) => {
      balance = values;
    }
  );
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
