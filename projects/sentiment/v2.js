const sdk = require("@defillama/sdk");

const PONDER_URL = "https://artistic-perfection-production.up.railway.app";

const SUPERPOOLS = [
  {
    superPool: "0x2831775cb5e64b1d892853893858a261e898fbeb",
    underlyingAsset: "hyperliquid:0x5555555555555555555555555555555555555555",
  },
];

// Allowed collateral tokens mapping (addresses are lowercased)
const SUPERPOOL_COLLATERAL_ASSETS = {
  "0x2831775cb5e64b1d892853893858a261e898fbeb": {
    "0x94e8396e0869c9f2200760af0621afd240e1cf38": true,
  },
};

const POOL_ADDRESS = "0x36BFD6b40e2c9BbCfD36a6B1F1Aa65974f4fFA5D";

// Fetch pool ID from Ponder for a given superPool address.
async function getPoolId(superPoolAddress) {
  const response = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetPoolId($superPoolId: String!) {
          superPool(id: $superPoolId) {
            poolConnections {
              items {
                pool {
                  id
                }
              }
            }
          }
        }
      `,
      variables: { superPoolId: superPoolAddress },
    }),
  });
  const result = await response.json();
  const poolConnection = result.data?.superPool?.poolConnections?.items?.[0];
  if (!poolConnection) {
    throw new Error(`Could not find pool ID for superPool ${superPoolAddress}`);
  }
  return poolConnection.pool.id;
}

// For each position, we sum the amounts of allowed collateral tokens.
async function fetchCollateral(superPoolAddress, poolId) {
  let collateralByToken = {};
  let afterCursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetch(`${PONDER_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetCollateralForPool($poolId: BigInt!, $after: String) {
            positionDebts(
              limit: 100
              after: $after
              where: { poolId: $poolId }
            ) {
              items {
                position {
                  positionAssets {
                    items {
                      assetAddress
                      amount
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: { poolId, after: afterCursor },
      }),
    });
    const result = await response.json();
    const items = result.data?.positionDebts?.items || [];
    for (const debt of items) {
      const assets = debt.position.positionAssets.items;
      for (const asset of assets) {
        const assetAddress = asset.assetAddress.toLowerCase();
        const allowedCollateral =
          SUPERPOOL_COLLATERAL_ASSETS[superPoolAddress.toLowerCase()];
        if (!allowedCollateral[assetAddress]) continue;

        if (!collateralByToken[assetAddress]) {
          collateralByToken[assetAddress] = BigInt(0);
        }
        collateralByToken[assetAddress] += BigInt(asset.amount);
      }
    }
    hasNextPage = result.data?.positionDebts?.pageInfo?.hasNextPage;
    afterCursor = result.data?.positionDebts?.pageInfo?.endCursor;
  }
  return collateralByToken;
}

async function tvl(api) {
  const balances = {};

  // --- LENDING TVL ---
  for (const { superPool, underlyingAsset } of SUPERPOOLS) {
    const totalAssets = await api.call({
      target: superPool,
      abi: "uint256:totalAssets",
    });
    sdk.util.sumSingleBalance(balances, underlyingAsset, totalAssets);
  }

  // --- COLLATERAL TVL ---
  // For each super pool, fetch its associated collateral from Ponder.
  for (const { superPool } of SUPERPOOLS) {
    try {
      const poolId = await getPoolId(superPool);
      const collateral = await fetchCollateral(superPool, poolId);
      for (const [token, amount] of Object.entries(collateral)) {
        sdk.util.sumSingleBalance(balances, `hyperliquid:${token}`, amount);
      }
    } catch (error) {
      console.error(
        "Error fetching collateral for superPool:",
        superPool,
        error
      );
    }
  }

  return balances;
}

async function borrowed(api) {
  const balances = {};

  // For each super pool, fetch its poolId and then
  // call the pool contract to get total borrowed amount.
  for (const { superPool, underlyingAsset } of SUPERPOOLS) {
    try {
      const poolId = await getPoolId(superPool);
      const totalBorrows = await api.call({
        target: POOL_ADDRESS,
        params: [poolId],
        abi: "function getTotalBorrows(uint256) view returns (uint256)",
      });
      sdk.util.sumSingleBalance(balances, underlyingAsset, totalBorrows);
    } catch (error) {
      console.error(
        "Error fetching borrowed amount for superPool:",
        superPool,
        error
      );
    }
  }
  return balances;
}

module.exports = {
  methodology:
    "We count total assets held in the Super Pool contracts (lending TVL) and collateral tokens from positions (fetched via Sentiment’s Ponder instance).",
  start: 1014900,
  hyperliquid: { tvl, borrowed },
};
