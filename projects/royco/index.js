const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");
const { sumUnknownTokens } = require("../helper/unknownTokens");

const slug = {
  1: {
    defillama: "ethereum",
    royco: "mainnet",
  },
  42161: {
    defillama: "arbitrum",
    royco: "arbitrum-one",
  },
  8453: {
    defillama: "base",
    royco: "base",
  },
};

const roycoSubgraph = {
  projectId: "project_cm07c8u214nt801v1b45zb60i",
  recipe: {
    version: "1.0.26",
  },
  vault: {
    version: "1.0.33",
  },
};

const getRecipeSubgraphUrl = (chainId) => {
  return `https://api.goldsky.com/api/public/${roycoSubgraph.projectId}/subgraphs/royco-recipe-${slug[chainId].royco}/${roycoSubgraph.recipe.version}/gn`;
};

const getVaultSubgraphUrl = (chainId) => {
  return `https://api.goldsky.com/api/public/${roycoSubgraph.projectId}/subgraphs/royco-vault-${slug[chainId].royco}/${roycoSubgraph.vault.version}/gn`;
};

const config = {
  [slug[1].defillama]: {
    chainId: 1,
    recipeSubgraphUrl: getRecipeSubgraphUrl(1),
    vaultSubgraphUrl: getVaultSubgraphUrl(1),
  },
  [slug[42161].defillama]: {
    chainId: 42161,
    recipeSubgraphUrl: getRecipeSubgraphUrl(42161),
    vaultSubgraphUrl: getVaultSubgraphUrl(42161),
  },
  [slug[8453].defillama]: {
    chainId: 8453,
    recipeSubgraphUrl: getRecipeSubgraphUrl(8453),
    vaultSubgraphUrl: getVaultSubgraphUrl(8453),
  },
};

Object.keys(config).forEach((chain) => {
  const { recipeSubgraphUrl, vaultSubgraphUrl } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const vaultMarketsQuery = gql`
        {
          rawMarkets {
            inputTokenId
            quantityOffered
            incentivesOfferedIds
            incentivesOfferedAmount
            endTimestamps
          }
        }
      `;

      const vaultMarkets = await request(vaultSubgraphUrl, vaultMarketsQuery);

      vaultMarkets.rawMarkets.map((market) => {
        const inputTokenId = market.inputTokenId.split("-")[1];
        const inputTokenAmount = market.quantityOffered;

        api.add(inputTokenId, inputTokenAmount);

        market.incentivesOfferedIds.forEach((rawIncentiveTokenId, index) => {
          const incentiveTokenId = rawIncentiveTokenId.split("-")[1];
          const incentiveTokenAmount = market.incentivesOfferedAmount[index];

          const endTimestampInSeconds = new BigNumber(
            market.endTimestamps[index]
          );
          const currTimestampInSeconds = new BigNumber(
            Math.floor(Date.now() / 1000)
          );

          if (currTimestampInSeconds.isLessThan(endTimestampInSeconds)) {
            api.add(incentiveTokenId, incentiveTokenAmount);
          }
        });
      });

      const recipePositionsQuery = gql`
        {
          rawPositions(where: { offerSide: 0 }) {
            inputTokenId
            quantity
            isWithdrawn
            tokenIds
            tokenAmounts
            isClaimed
          }
        }
      `;

      const recipePositions = await request(
        recipeSubgraphUrl,
        recipePositionsQuery
      );

      recipePositions.rawPositions.map((position) => {
        const inputTokenId = position.inputTokenId.split("-")[1];
        const inputTokenAmount = position.quantity;

        if (position.isWithdrawn === false) {
          api.add(inputTokenId, inputTokenAmount);
        }

        position.tokenIds.forEach((tokenId, index) => {
          const incentiveTokenId = tokenId.split("-")[1];
          const incentiveTokenAmount = position.tokenAmounts[index];

          if (position.isClaimed[index] === false) {
            api.add(incentiveTokenId, incentiveTokenAmount);
          }
        });
      });

      return sumUnknownTokens({
        api,
        resolveLP: true,
        useDefaultCoreAssets: true,
      });
    },
  };
});
