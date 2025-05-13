const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");
const { sumUnknownTokens } = require("../helper/unknownTokens");

const slug = {
  1: {
    defillama: "ethereum",
    royco: "mainnet",
  },
  146: {
    defillama: "sonic",
    royco: "sonic",
  },
  999: {
    defillama: "hyperliquid",
    royco: "hyperevm",
  },
  8453: {
    defillama: "base",
    royco: "base",
  },
  42161: {
    defillama: "arbitrum",
    royco: "arbitrum-one",
  },
  80094: {
    defillama: "berachain",
    royco: "berachain",
  },
  21000000: {
    defillama: "corn",
    royco: "corn-maizenet",
  },
};

const config = {
  [slug[1].defillama]: {
    chainId: 1,
  },
  [slug[146].defillama]: {
    chainId: 146,
  },
  [slug[999].defillama]: {
    chainId: 999,
  },
  [slug[8453].defillama]: {
    chainId: 8453,
  },
  [slug[42161].defillama]: {
    chainId: 42161,
  },
  [slug[80094].defillama]: {
    chainId: 80094,
  },
  [slug[21000000].defillama]: {
    chainId: 21000000,
  },
};

const fetchAllTokenBalanceSubgraphRows = async ({ subgraphUrl, queryName }) => {
  let allRows = [];

  let skip = 0;
  let pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const formattedQuery = gql`
      {
        ${queryName}(where: {tokenClass: "0"}, first: ${pageSize}, skip: ${skip}) {
          id
          tokenId
          tokenAmount
        }
      }
    `;

    const result = await request(subgraphUrl, formattedQuery);
    const newRows = result[queryName];
    allRows = [...allRows, ...newRows];

    hasMore = newRows.length === pageSize;
    skip += pageSize;
  }

  return allRows;
};

const addToken = async ({ api, rows }) => {
  rows.map((row) => {
    const tokenAddress = row.tokenId.split("-")[1];
    const tokenAmount = row.tokenAmount;

    api.add(tokenAddress, tokenAmount);
  });
};

const calculateTvl = async ({ api, chain }) => {
  if (chain === slug[80094].defillama) {
    const subgraphUrl = `https://api.goldsky.com/api/public/project_cm07c8u214nt801v1b45zb60i/subgraphs/royco-ccdm-destination-boyco-berachain-mainnet/2.0.2/gn`;

    const rows = await fetchAllTokenBalanceSubgraphRows({
      subgraphUrl,
      queryName: "rawMarketTokenBalanceRecipes",
    });

    await addToken({ api, rows });
  } else {
    const recipeSubgraphUrl = `https://api.goldsky.com/api/public/project_cm07c8u214nt801v1b45zb60i/subgraphs/royco-recipe-${
      slug[config[chain].chainId].royco
    }/2.0.29/gn`;

    const recipeRows = await fetchAllTokenBalanceSubgraphRows({
      subgraphUrl: recipeSubgraphUrl,
      queryName: "rawMarketTokenBalanceRecipes",
    });

    await addToken({ api, rows: recipeRows });

    const vaultSubgraphUrl = `https://api.goldsky.com/api/public/project_cm07c8u214nt801v1b45zb60i/subgraphs/royco-vault-${
      slug[config[chain].chainId].royco
    }/2.0.18/gn`;

    const vaultRows = await fetchAllTokenBalanceSubgraphRows({
      subgraphUrl: vaultSubgraphUrl,
      queryName: "rawMarketTokenBalanceVaults",
    });

    await addToken({ api, rows: vaultRows });
  }
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      await calculateTvl({ api, chain });

      return sumUnknownTokens({
        api,
        resolveLP: true,
        useDefaultCoreAssets: true,
      });
    },
  };
});
