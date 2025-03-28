const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const PONDER_URL = "https://artistic-perfection-production.up.railway.app";
const PORTFOLIO_LENS_ADDRESS = "0x9700750001dDD7C4542684baC66C64D74fA833c0";

const SUPERPOOLS = [
  {
    superPool: "0x2831775cb5e64b1d892853893858a261e898fbeb",
    underlyingAsset: "hyperliquid:" + ADDRESSES.hyperliquid.WHYPE,
  },
];

const POOL_ADDRESS = "0x36BFD6b40e2c9BbCfD36a6B1F1Aa65974f4fFA5D";

async function getPoolId(superPoolAddress) {
  const response = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetPoolId($superPoolId: String!) {
          superPool(id: $superPoolId) {
            poolConnections {
              items { pool { id } }
            }
          }
        }
      `,
      variables: { superPoolId: superPoolAddress },
    }),
  });

  const result = await response.json();
  const poolConnection = result.data?.superPool?.poolConnections?.items?.[0];
  if (!poolConnection)
    throw new Error(`Could not find pool ID for ${superPoolAddress}`);

  return poolConnection.pool.id;
}

async function getPositionAddresses(poolId) {
  let positions = [];
  let afterCursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetch(`${PONDER_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetPositions($poolId: BigInt!, $after: String) {
            positions(limit: 100, after: $after, where: { poolId: $poolId }) {
              items { id }
              pageInfo { hasNextPage, endCursor }
            }
          }
        `,
        variables: { poolId, after: afterCursor },
      }),
    });

    const result = await response.json();
    const items = result.data?.positions?.items || [];
    positions.push(...items.map((i) => i.id));

    hasNextPage = result.data?.positions?.pageInfo?.hasNextPage;
    afterCursor = result.data?.positions?.pageInfo?.endCursor;
  }

  return positions;
}

async function tvl(api) {
  const balances = {};

  // Lending TVL
  for (const { superPool, underlyingAsset } of SUPERPOOLS) {
    const totalAssets = await api.call({
      target: superPool,
      abi: "uint256:totalAssets",
    });
    sdk.util.sumSingleBalance(balances, underlyingAsset, totalAssets);
  }

  // Collateral TVL
  for (const { superPool } of SUPERPOOLS) {
    try {
      const poolId = await getPoolId(superPool);
      const positions = await getPositionAddresses(poolId);

      const assetData = await api.multiCall({
        abi: "function getAssetData(address) view returns ((address asset, uint256 amount, uint256 valueInEth)[])",
        calls: positions,
        target: PORTFOLIO_LENS_ADDRESS,
      });

      assetData.flat().forEach(({ asset, amount }) => {
        sdk.util.sumSingleBalance(balances, `hyperliquid:${asset}`, amount);
      });
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
      console.error("Error fetching borrowed amount:", superPool, error);
    }
  }

  return balances;
}

module.exports = {
  methodology:
    "Sums assets held by SuperPool contracts (lending TVL) and collateral held by all Position contracts.",
  start: 1014900,
  hyperliquid: { tvl, borrowed },
};
