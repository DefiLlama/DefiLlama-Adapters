const { request, gql } = require("graphql-request");

const MORPHO_API = "https://blue-api.morpho.org/graphql";

const query = gql`
  query GetFelixMarkets($skip: Int) {
    markets(where: { chainId_in: [999] }, first: 100, skip: $skip) {
      items {
        uniqueKey
        state {
          supplyAssets
          borrowAssets
          collateralAssets
        }
        collateralAsset {
          address
        }
        loanAsset {
          address
        }
        supplyingVaults {
          name
          whitelisted
        }
      }
    }
  }
`;

const getFelixMarketsData = async (api) => {
  let allMarkets = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const data = await request(MORPHO_API, query, { skip });
      const markets = data.markets.items;

      const felixMarkets = markets.filter(
        (market) =>
          market.supplyingVaults &&
          market.supplyingVaults.some(
            (vault) => vault.whitelisted && vault.name.includes("Felix")
          )
      );

      allMarkets.push(...felixMarkets);

      if (markets.length < 100) hasMore = false;
      else skip += 100;
    } catch (e) {
      api.log("Error fetching Morpho API", e);
      hasMore = false;
    }
  }
  return allMarkets;
};

const tvl = async (api) => {
  const markets = await getFelixMarketsData(api);

  markets.forEach((market) => {
    // Add Supply (Liquidity + Borrows)
    if (market.state.supplyAssets) {
      api.add(market.loanAsset.address, market.state.supplyAssets);
    }
    // Add Collateral
    if (market.state.collateralAssets) {
      api.add(market.collateralAsset.address, market.state.collateralAssets);
    }
  });

  return api.getBalances();
};

module.exports = {
  methodology:
    "Counts TVL of Morpho Blue markets on Hyperliquid where Felix Vaults are whitelisted.",
  hyperliquid: {
    tvl,
  },
};
