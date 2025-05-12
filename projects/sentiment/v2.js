const ADDRESSES = require("../helper/coreAssets.json");
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

async function getPositionAddresses() {
  let positions = [];
  let afterCursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetch(`${PONDER_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetPositions($after: String) {
            positions(limit: 999, after: $after) {
              items {
                id
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: { after: afterCursor },
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
    const poolId = await getPoolId(superPool);
    const totalBorrows = await api.call({
      target: POOL_ADDRESS,
      params: [poolId],
      abi: "function getTotalBorrows(uint256) view returns (uint256)",
    });
    const totalAssets = await api.call({
      target: POOL_ADDRESS,
      params: [poolId],
      abi: "function getTotalAssets(uint256) view returns (uint256)",
    });
    const availableLiquidity = BigInt(totalAssets) - BigInt(totalBorrows);
    sdk.util.sumSingleBalance(balances, underlyingAsset, availableLiquidity);
  }

  // Collateral TVL
  const positions = await getPositionAddresses();

  // Batch positions into chunks of 30
  const BATCH_SIZE = 30;
  for (let i = 0; i < positions.length; i += BATCH_SIZE) {
    const positionBatch = positions.slice(i, i + BATCH_SIZE);

    const assetDataBatch = await api.multiCall({
      abi: "function getAssetData(address) view returns ((address asset, uint256 amount, uint256 valueInEth)[])",
      calls: positionBatch,
      target: PORTFOLIO_LENS_ADDRESS,
    });

    assetDataBatch.flat().forEach(({ asset, amount }) => {
      sdk.util.sumSingleBalance(balances, `hyperliquid:${asset}`, amount);
    });
  }

  return balances;
}

async function borrowed(api) {
  const balances = {};

  for (const { superPool, underlyingAsset } of SUPERPOOLS) {
    const poolId = await getPoolId(superPool);
    const totalBorrows = await api.call({
      target: POOL_ADDRESS,
      params: [poolId],
      abi: "function getTotalBorrows(uint256) view returns (uint256)",
    });
    sdk.util.sumSingleBalance(balances, underlyingAsset, totalBorrows);
  }

  return balances;
}

module.exports = {
  methodology:
    "Sums assets held by SuperPool contracts (lending TVL) and collateral held by all Position contracts.",
  start: 1014900,
  hyperliquid: { tvl, borrowed },
};
